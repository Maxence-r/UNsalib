import { Course, CourseSchemaProperties } from "models/course.model.js";
import { HydratedDocument, Types } from "mongoose";
import { roomsService } from "services/rooms.service.js";
import { areArraysEqual } from "utils/array.js";

interface NormalizedCourse {
    univId: number;
    celcatId: string;
    start: Date;
    end: Date;
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
        })),
    );
}

// Return a normalized course index if found in an array on normalized courses,
// null otherwise
async function getCourseIndex(
    searchedCourse: NormalizedCourse,
    courses: NormalizedCourse[],
): Promise<null | number> {
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
            areArraysEqual(course.modules, searchedCourse.modules)
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
        wantedCourseIndex = await getCourseIndex(course, normalizedUnivCourses);

        if (wantedCourseIndex) {
            // If the course is found, remove it from the University and DB courses arrays
            normalizedUnivCourses.splice(wantedCourseIndex, 1);
            dbCourses.splice(wantedCourseIndex, 1);
            // We update normalizedDbCourses even if we are not going to use it again,
            // but it should save some time to reduce the array size to loop through
            normalizedDbCourses.splice(wantedCourseIndex, 1);
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

    // TODO AFTER

    // Browse courses that remain in normalizedUnivCourses (new to our database)
    for (const course of normalizedUnivCourses) {
        // Checking if data is valid (e.g: exclude holidays with no associated rooms)
        if (
            !course.start_at ||
            !course.end_at ||
            !course.id ||
            !course.celcat_id ||
            !course.rooms_for_item_details
        )
            continue;

        // Processing the course's rooms, teachers and modules to put them into our DB format
        let rooms = splitUnivDataBlocks(course.rooms_for_item_details);
        rooms = await Promise.all(
            rooms.map(
                async (roomName) => (await processRoom(roomName, campusId))._id,
            ),
        );
        const teachers = splitUnivDataBlocks(course.teachers_for_blocks);
        const modules = splitUnivDataBlocks(course.modules_for_blocks);

        // Building a minimal query
        const dbQuery: {
            univId: string;
            start: string;
            end: string;
            category: string;
            notes: string;
            rooms: { $all: string[]; $size: number }[];
            teachers: { $all: string[]; $size: number }[];
            modules: { $all: string[]; $size: number }[];
        } = {
            univId: course.id.toString(),
            start: course.start_at,
            end: course.end_at,
            category: course.categories || "",
            notes: course.notes || "",
            rooms: [], // empty by default
            teachers: [],
            modules: [],
        };
        // If there are rooms, teachers or modules, add it to the query
        if (rooms.length > 0) {
            dbQuery.rooms = {
                $all: rooms, // only checks that all the elements of rooms are present
                $size: rooms.length, // so we need to also check the array size
                // if it contains exactly all the rooms it's the same array
            };
        }
        if (teachers.length > 0) {
            dbQuery.teachers = {
                $all: teachers,
                $size: teachers.length,
            };
        }
        if (modules.length > 0) {
            dbQuery.modules = {
                $all: modules,
                $size: modules.length,
            };
        }
        // Executing the query
        const existingCourse = await Course.findOne(dbQuery);

        if (
            !existingCourse ||
            existingCourse === null ||
            existingCourse === undefined
        ) {
            // If the course doesn't exists, create it in our DB
            const newCourse = new Course({
                univId: course.id,
                celcatId: course.celcat_id,
                category: course.categories || "",
                start: course.start_at,
                end: course.end_at,
                notes: course.notes || "",
                color: closestPaletteColor(course.color) || "#FF7675",
                rooms: rooms,
                teachers: teachers,
                groups: [dbGroupId],
                modules: modules,
            });
            await newCourse.save();
            result.created += 1;
        } else {
            // If the course already exists, add the current processed group to its record
            await Course.updateOne(
                { _id: existingCourse._id },
                {
                    $push: { groups: dbGroupId },
                },
            );
            result.updated += 1;
        }
    }

    return result;
}
