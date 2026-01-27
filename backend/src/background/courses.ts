import { Course, CourseSchemaProperties } from "models/course.model.js";
import { HydratedDocument, Types } from "mongoose";
import { roomsService } from "services/rooms.service.js";
import { areArraysEqual } from "utils/misc.js";
import { closestPaletteColor } from "../utils/color.js";
import { sanitizeJsonString } from "utils/misc.js";
import { GroupSchemaProperties } from "models/group.model.js";
import { getStringBoundDates } from "utils/date.js";
import { config } from "configs/app.config.js";
import { logger } from "utils/logger.js";
import { socket } from "server.js";

interface NormalizedCourse {
    univId: number;
    celcatId: string;
    start: Date;
    end: Date;
    category?: string | null;
    color?: string;
    rooms: string[];
    teachers: string[];
    modules: string[];
}

interface UnivApiCourse {
    id: number;
    celcat_id: string;
    categories: string;
    start_at: string;
    end_at: string;
    notes: string;
    custom1: null;
    custom2: null;
    custom3: null;
    color: string;
    place_id: number;
    rooms_for_blocks: string;
    rooms_for_item_details: string;
    teachers_for_blocks: string;
    teachers_for_item_details: string;
    educational_groups_for_blocks: string;
    educational_groups_for_item_details: string;
    modules_for_blocks: string;
    modules_for_item_details: string;
}

// Storage of the average processing time for each group
const stats = {
    timeSum: 0,
    groupsProcessed: 0,
    removed: 0,
    added: 0,
    updated: 0,
};
const groupFetchStatsInterval = 10;

// Split a string present in the data supplied by the University
// (blocks separated by ;) and return an array of elements
function splitUnivDataBlocks(blocks: string): string[] {
    if (blocks && blocks !== "") {
        return blocks.split(";").map((item) => item.trim());
    }
    return [];
}

function getNormalizedUnivCourses(
    courses: UnivApiCourse[],
): NormalizedCourse[] {
    return courses.map((course) => ({
        univId: course.id,
        celcatId: course.celcat_id,
        start: new Date(course.start_at),
        end: new Date(course.end_at),
        rooms: splitUnivDataBlocks(course.rooms_for_blocks),
        teachers: splitUnivDataBlocks(course.teachers_for_blocks),
        modules: splitUnivDataBlocks(course.modules_for_blocks),
        ...(course.categories && { category: course.categories }),
        ...(course.color && { color: course.color }),
    }));
}

async function getNormalizedDbCourses(
    courses: (CourseSchemaProperties & { _id: Types.ObjectId })[],
): Promise<NormalizedCourse[]> {
    return Promise.all(
        courses.map(async (course) => ({
            univId: course.univId,
            celcatId: course.celcatId,
            start: course.start,
            end: course.end,
            rooms: await Promise.all(
                course.rooms.map(
                    async (roomId) =>
                        (await roomsService.getRoomById(roomId)).univId,
                ),
            ),
            teachers: course.teachers,
            modules: course.modules,
            category: course.category,
        })),
    );
}

// Return a normalized course index if found in an array on normalized courses,
// null otherwise
function getCourseIndex(
    searchedCourse: NormalizedCourse,
    courses: NormalizedCourse[],
): null | number {
    // Eliminate each course by testing its characteristics from the most likely to
    // differ to the least likely
    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];

        if (
            course.univId === searchedCourse.univId &&
            course.celcatId === searchedCourse.celcatId &&
            course.start.getTime() === searchedCourse.start.getTime() &&
            course.end.getTime() === searchedCourse.end.getTime() &&
            areArraysEqual(course.rooms, searchedCourse.rooms) &&
            areArraysEqual(course.teachers, searchedCourse.teachers) &&
            areArraysEqual(course.modules, searchedCourse.modules) &&
            course.category === searchedCourse.category
        ) {
            // This course is the same as the searched course
            return i;
        }
    }

    // Not found
    return null;
}

// Processes all the courses in a given group to perform add/remove/update operations in our database
async function processGroupCourses(
    univCourses: UnivApiCourse[],
    dbCourses: HydratedDocument<CourseSchemaProperties>[],
    dbGroupId: Types.ObjectId,
    campusId: Types.ObjectId,
): Promise<{
    removed: number;
    updated: number;
    created: number;
}> {
    // Creating a variable to store the operations that have been performed in our database
    const result = { removed: 0, updated: 0, created: 0 };

    const normalizedUnivCourses = getNormalizedUnivCourses(univCourses);
    const normalizedDbCourses = await getNormalizedDbCourses(dbCourses);

    // Parsing all the DB courses for this group
    let wantedCourseIndex: number | null;
    for (const course of normalizedDbCourses) {
        // Trying to find the course in the latest University data
        wantedCourseIndex = getCourseIndex(course, normalizedUnivCourses);

        if (wantedCourseIndex) {
            // If the course is found, remove it from the University and DB courses arrays
            normalizedUnivCourses.splice(wantedCourseIndex, 1);
            dbCourses.splice(wantedCourseIndex, 1);
        }
    }
    // Now, normalizedUnivCourses only contains courses that need to be added to our DB
    // and dbCourses contains courses that need to be deleted

    // Browse courses that need to be deleted from our DB
    for (const course of dbCourses) {
        if (course.groups.length > 1) {
            // If there are several groups in the course record, just delete the group
            course.groups.filter((group) => group !== dbGroupId);
            await course.save();
            result.updated++;
        } else {
            // If there is only the current processed group in the course record, delete it
            await Course.deleteOne({ _id: course._id });
            result.removed++;
        }
    }

    // Browse courses that remain in normalizedUnivCourses (new to our database or need to be updated)
    for (const course of normalizedUnivCourses) {
        // Check if data is valid (e.g: exclude holidays with no associated rooms)
        if (!course.rooms) continue;

        // Process the course's rooms, teachers and modules to put them into our DB format
        const cleanRooms = await Promise.all(
            course.rooms.map(
                async (roomName) =>
                    await roomsService.addRoomIfNotExists(roomName, campusId),
            ),
        );

        const existingCourse = await Course.findOne({
            univId: course.univId,
            start: course.start,
            end: course.end,
            ...(course.category && { category: course.category }),
            ...(cleanRooms
                ? {
                      $all: cleanRooms, // only check that all the elements of rooms are present
                      $size: cleanRooms.length, // so we need to also check the array size
                      // If it contains exactly all the rooms then it's the same array
                  }
                : []),
            ...(course.teachers
                ? {
                      $all: course.teachers,
                      $size: course.teachers.length,
                  }
                : []),
            ...(course.modules
                ? {
                      $all: course.modules,
                      $size: course.modules.length,
                  }
                : []),
        });

        if (existingCourse) {
            // If the course already exists, add the current processed group to its record
            await Course.updateOne(
                { _id: existingCourse._id },
                {
                    $push: { groups: dbGroupId },
                },
            );
            result.updated++;
        } else {
            // If the course doesn't exists, create it in our DB
            const newCourse = new Course({
                univId: course.univId,
                celcatId: course.celcatId,
                start: course.start,
                end: course.end,
                color: closestPaletteColor(course.color ?? "#bdc3c7"),
                rooms: cleanRooms,
                teachers: course.teachers,
                groups: [dbGroupId],
                modules: course.modules,
                ...(course.category && { category: course.category }),
            });
            await newCourse.save();
            result.created++;
        }
    }

    return result;
}

// Retrieve courses for a group
async function fetchGroupCourses(
    group: GroupSchemaProperties & { _id: Types.ObjectId },
    campusId: Types.ObjectId,
): Promise<void> {
    // Save the start time to make stats
    const startProcessingTime = Date.now();

    // Get dates for the specified amount of time
    const dates = getStringBoundDates(config.tasks.daysToRetrieve);

    // Build the request URL
    const requestUrl = `https://edt-v2.univ-nantes.fr/events?start=${dates.start}&end=${dates.end}&timetables%5B%5D=${group.univId}`;

    try {
        // Get data from the Nantes Université timetable API
        const response = await fetch(requestUrl);
        const jsonData = JSON.parse(
            sanitizeJsonString(await response.text()),
        ) as UnivApiCourse[];

        // Get some related data from our database
        const dbCourseRecords = await Course.find({
            start: { $gte: new Date(dates.start) },
            end: { $lte: new Date(dates.end) },
            groups: group._id,
        });

        // Process all the courses for this group
        const result = await processGroupCourses(
            jsonData,
            dbCourseRecords,
            group._id,
            campusId,
        );

        // Calculate the new average processing time
        const processingTime = Date.now() - startProcessingTime;
        stats.timeSum += processingTime;
        stats.groupsProcessed++;

        // Log if needed
        if (stats.groupsProcessed > groupFetchStatsInterval) {
            logger.info(
                `${groupFetchStatsInterval} groups processed in ${parseFloat("" + stats.timeSum / stats.groupsProcessed / 1000).toFixed(2)}s`,
            );
            logger.info(
                `Removed: ${result.removed} | Updated: ${result.updated} | Created: ${result.created}`,
            );
            stats.timeSum = 0;
            stats.groupsProcessed = 0;
            stats.removed = 0;
            stats.added = 0;
            stats.updated = 0;
        }

        // Sending an update message to all clients
        socket.sendGroupsUpdate(group.name);
    } catch (error) {
        logger.error(
            `Cannot retrieve timetable for the ${group.name} group (univId: ${group.univId}, url: ${requestUrl})`,
            error,
        );
    }
}

export { fetchGroupCourses };
