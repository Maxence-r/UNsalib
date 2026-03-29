import type { Types, HydratedDocument } from "mongoose";

import { Course, CourseSchemaProperties } from "../models/course.model.js";
import type { GroupSchemaProperties } from "../models/group.model.js";
import {
    extractCoursesFromCelcatXml,
    extractCoursesFromUnivJson,
    type NormalizedCourse,
} from "../utils/extractors.js";
import { dataConfig } from "../configs/data.config.js";
import { getStringBoundDates } from "../utils/date.js";
import { SectorSchemaProperties } from "../models/sector.model.js";
import { logger } from "../utils/logger.js";
import { areArraysEqual, sanitizeJsonString } from "../utils/misc.js";
import { roomsService } from "./rooms.service.js";
import { closestPaletteColor } from "../utils/color.js";
import { sectorsService } from "./sectors.service.js";
import { groupsService } from "./groups.service.js";

class CoursesService {
    /**
     * Return the timetable for a specific room
     */
    async getTimetable(
        roomId: string,
        start: string,
        end: string,
    ): Promise<(CourseSchemaProperties & { _id: Types.ObjectId })[]> {
        // Getting courses based on room id and given period
        return await Course.find({
            rooms: roomId, // the room is included in the course rooms array
            $and: [{ start: { $gte: start } }, { end: { $lte: end } }],
        }).lean();
    }

    /**
     * Find overlapping courses for a specific time range
     */
    async getOverlappingCourses(
        start: string,
        end: string,
    ): Promise<(CourseSchemaProperties & { _id: Types.ObjectId })[]> {
        // Recherche de tous les cours qui débordent sur la période demandée selon 4 cas :
        //
        // CAS 1 : Le cours englobe complètement la période
        // Cours       |--------------------|
        // Demande         |-----------|
        //
        // CAS 2 : Le cours est englobé par la période
        // Cours           |-----------|
        // Demande     |--------------------|
        //
        // CAS 3 : Le cours chevauche le début de la période
        // Cours       |-----------|
        // Demande         |-----------|
        //
        // CAS 4 : Le cours chevauche la fin de la période
        // Cours           |-----------|
        // Demande     |-----------|
        //
        return await Course.find({
            $and: [
                { start: { $lt: end } }, // le cours commence avant la fin de la période demandée
                { end: { $gt: start } }, // le cours finit après le début de la période demandée
            ],
        }).lean();
    }

    /**
     * Clear group references from courses
     */
    async clearGroupReferences(groupId: string): Promise<void> {
        const courses = await Course.find({ groups: groupId });

        for (const course of courses) {
            if (course.groupIds.length === 1) {
                // If the group is the only one linked to the course, delete the course
                await course.deleteOne();
            } else {
                // Otherwise, just remove the group from the course
                course.groupIds = course.groupIds.filter((g) => g !== groupId);
                await course.save();
            }
        }
    }

    /**
     * Get course documents by room
     */
    async getCourseDocsByRoom(
        roomId: Types.ObjectId,
    ): Promise<HydratedDocument<CourseSchemaProperties>[]> {
        return await Course.find({ rooms: roomId });
    }

    /**
     * Get course documents associated with a group and included
     * in a specified range
     */
    async getCourseDocsByGroupAndRange(
        start: Date,
        end: Date,
        groupId: string,
    ): Promise<HydratedDocument<CourseSchemaProperties>[]> {
        return await Course.find({
            start: { $gte: start },
            end: { $lte: end },
            groups: groupId,
        });
    }

    /**
     * Search a course and return its corresponding document if found, null otherwise
     */
    async findCourseDoc(
        celcatId: number,
        start: Date,
        end: Date,
        roomIds: string[],
        teachers: string[],
        modules: string[],
        category?: string,
    ): Promise<null | HydratedDocument<CourseSchemaProperties>> {
        return (
            (await Course.findOne({
                celcatId: celcatId,
                start: start,
                end: end,
                ...(category && { category: category }),
                ...(roomIds
                    ? {
                          roomIds: {
                              $all: roomIds, // only check that all the elements of rooms are present
                              $size: roomIds.length, // so we need to also check the array size
                              // If it contains exactly all the rooms then it's the same array
                          },
                      }
                    : []),
                ...(teachers
                    ? {
                          teachers: {
                              $all: teachers,
                              $size: teachers.length,
                          },
                      }
                    : []),
                ...(modules
                    ? {
                          modules: {
                              $all: modules,
                              $size: modules.length,
                          },
                      }
                    : []),
            })) ?? null
        );
    }

    /**
     * Add a group to a course
     */
    async addGroupToCourse(
        courseId: Types.ObjectId,
        groupId: Types.ObjectId,
    ): Promise<void> {
        await Course.updateOne(
            { _id: courseId },
            {
                $push: { groups: groupId },
            },
        );
    }

    /**
     * Add a course
     */
    async addCourse(
        celcatId: number,
        start: Date,
        end: Date,
        color: string,
        rooms: string[],
        teachers: string[],
        modules: string[],
        groupId: string,
        category?: string,
    ): Promise<void> {
        await new Course({
            celcatId: celcatId,
            start: start,
            end: end,
            color: color,
            roomIds: rooms,
            teachers: teachers,
            groupIds: [groupId],
            modules: modules,
            ...(category && { category: category }),
        }).save();
    }

    /**
     * Delete a course
     */
    async deleteCourse(id: Types.ObjectId): Promise<void> {
        await Course.deleteOne({ _id: id });
    }

    async processGroupCourses(
        normalizedUnivCourses: NormalizedCourse[],
        dbCourses: HydratedDocument<CourseSchemaProperties>[],
        groupId: string,
        campusId: string,
    ): Promise<{
        removed: number;
        updated: number;
        created: number;
    }> {
        // Creating a variable to store the operations that have been performed in our database
        const result = { removed: 0, updated: 0, created: 0 };

        // Return a course index if found in an array on normalized courses,
        // null otherwise
        const getCourseIndex = (
            searchedCourse: HydratedDocument<CourseSchemaProperties>,
            courses: NormalizedCourse[],
        ): null | number => {
            // Eliminate each course by testing its characteristics from the most likely to
            // differ to the least likely
            for (let i = 0; i < courses.length; i++) {
                const course = courses[i];

                if (
                    course.celcatId === searchedCourse.celcatId &&
                    course.start.getTime() === searchedCourse.start.getTime() &&
                    course.end.getTime() === searchedCourse.end.getTime() &&
                    areArraysEqual(course.rooms, searchedCourse.roomIds) &&
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
        };

        // Parsing all the DB courses for this group
        let wantedCourseIndex: number | null;
        const toBeDeletedFromDb: HydratedDocument<CourseSchemaProperties>[] =
            [];
        for (const course of dbCourses) {
            // Trying to find the course in the latest University data
            wantedCourseIndex = getCourseIndex(course, normalizedUnivCourses);

            if (!wantedCourseIndex) {
                // If the course is not found, flag it for deletion
                toBeDeletedFromDb.push(course);
                // normalizedUnivCourses.splice(wantedCourseIndex, 1);
                // toBeDeletedFromDb.splice(wantedCourseIndex, 1);
            } else {
                normalizedUnivCourses.splice(wantedCourseIndex, 1);
            }
        }
        // Now, normalizedUnivCourses only contains courses that need to be added to our DB
        // and dbCourses contains courses that need to be deleted

        // Browse courses that need to be deleted from our DB
        for (const course of toBeDeletedFromDb) {
            if (course.groupIds.length > 1) {
                // If there are several groups in the course record, just delete the group
                course.groupIds = course.groupIds.filter(
                    (group) => group !== groupId,
                );
                await course.save();
                result.updated++;
            } else {
                // If there is only the current processed group in the course record, delete it
                await coursesService.deleteCourse(course._id);
                result.removed++;
            }
        }

        // Browse courses that remain in normalizedUnivCourses (new to our database or need to be updated)
        for (const course of normalizedUnivCourses) {
            // Check if data is valid (e.g: exclude holidays with no associated rooms)
            if (course.rooms.length === 0) continue;

            // Process the course's rooms to save them to our database if needed
            const cleanRooms = await Promise.all(
                course.rooms.map(
                    async (roomName) =>
                        await roomsService.processRawRoom(roomName, campusId),
                ),
            );

            const existingCourse = await coursesService.findCourseDoc(
                course.celcatId,
                course.start,
                course.end,
                cleanRooms,
                course.teachers,
                course.modules,
                course.category ?? undefined,
            );

            if (existingCourse) {
                // If the course already exists, add the current processed group to its record
                existingCourse.groupIds.push(groupId);
                result.updated++;
            } else {
                // If the course doesn't exists, create it in our DB
                await coursesService.addCourse(
                    course.celcatId,
                    course.start,
                    course.end,
                    closestPaletteColor(course.color),
                    cleanRooms,
                    course.teachers,
                    course.modules,
                    groupId,
                    course.category ?? undefined,
                );
                result.created++;
            }
        }

        return result;
    }

    async syncGroupCourses(
        group: GroupSchemaProperties,
        sector: SectorSchemaProperties,
        daysToSync: number,
    ): Promise<{
        removed: number;
        updated: number;
        created: number;
    }> {
        // Get dates for the specified amount of time
        const boundDates = getStringBoundDates(daysToSync);

        class NoCelcatError extends Error {}
        let extractedCourses: NormalizedCourse[];
        try {
            if (!group.celcatId) throw new NoCelcatError();

            const requestUrl = `${dataConfig.baseUrlCelcat}/${sector.celcatId}/g${group.celcatId}.xml`;
            const celcatResponse = await fetch(requestUrl);

            if (celcatResponse.status !== 200)
                throw new Error(
                    `Cannot fetch courses from Celcat, code ${celcatResponse.status} returned for request with URL '${requestUrl}'`,
                );

            // By default, Celcat give us the whole year, so we need to remove
            // courses that do not take place in the range to reduce work later
            extractedCourses = (
                await extractCoursesFromCelcatXml(await celcatResponse.text())
            ).filter(
                (c) =>
                    c.start.toISOString().split("T")[0] >= boundDates.start &&
                    c.end.toISOString().split("T")[0] <= boundDates.end,
            );
        } catch (e) {
            if (!(e instanceof NoCelcatError)) {
                logger.warn(
                    `Cannot sync timetable with Celcat for the '${group._id}' group of the ${sector.campusId} campus, sector '${sector._id}'`,
                );
                logger.warn("Switching to univ API");
                logger.warn(e);
            }

            const univResponse = await fetch(
                `${dataConfig.baseUrl}/events?start=${boundDates.start}&end=${boundDates.end}&timetables%5B%5D=${group.univId}`,
            );
            extractedCourses = extractCoursesFromUnivJson(
                sanitizeJsonString(await univResponse.text()),
            );
        }

        // Get some related data from our database
        const dbCourseRecords =
            await coursesService.getCourseDocsByGroupAndRange(
                new Date(boundDates.start),
                new Date(boundDates.end),
                group._id,
            );

        // Process all the courses for this group
        const result = await this.processGroupCourses(
            extractedCourses,
            dbCourseRecords,
            group._id,
            sector.campusId,
        );

        return {
            removed: result.removed,
            updated: result.updated,
            created: result.created,
        };
    }

    async syncAll(
        syncInterval: number,
        daysToSync: number,
    ): Promise<void> {
        const allGroups: {
            details: GroupSchemaProperties;
            sector: SectorSchemaProperties;
        }[] = [];

        const sectors = await sectorsService.getAll();
        for (const sector of sectors) {
            const groups = await groupsService.getBySectorId(sector._id);

            for (const group of groups) {
                allGroups.push({ details: group, sector: sector });
            }
        }

        // Stats storage
        const stats = {
            timeSum: 0,
            groupsProcessed: 0,
            failed: 0,
            removed: 0,
            added: 0,
            updated: 0,
        };

        // Calculating the interval between each group for a uniform distribution
        const intervalBetweenGroups = (syncInterval / allGroups.length) * 60 * 60 * 1000;

        let groupIndex = 0;

        const scheduleNextGroup = (): void => {
            if (groupIndex < allGroups.length) {
                const syncGroupTimetable = async (): Promise<void> => {
                    const group = allGroups[groupIndex];

                    try {
                        // Save the start time to get the processing time
                        const startProcessingTime = Date.now();

                        const results = await this.syncGroupCourses(
                            group.details,
                            group.sector,
                            daysToSync,
                        );

                        // Calculate new stats
                        stats.timeSum += Date.now() - startProcessingTime;
                        stats.added += results.created;
                        stats.updated += results.updated;
                        stats.removed += results.removed;
                        stats.groupsProcessed++;
                    } catch (e) {
                        logger.error(
                            `Cannot sync timetable for the '${group.details._id}' group of the ${group.sector.campusId} campus, sector '${group.sector._id}'`,
                        );
                        logger.error(e);
                        stats.failed++;
                    } finally {
                        // Recursively call the next iteration
                        groupIndex++;
                        scheduleNextGroup();
                    }
                };

                if (groupIndex % 10 === 0) {
                    // Display progress each 10 groups
                    logger.info(
                        `Timetables sync progress: ${Math.round((100 * groupIndex) / allGroups.length)}%`,
                    );
                }

                setTimeout(
                    () => void syncGroupTimetable(),
                    intervalBetweenGroups,
                );
            } else {
                // All groups were processed
                logger.info(
                    `${stats.groupsProcessed} groups processed (${stats.failed} failed) | Average processing time: ${parseFloat(`${stats.timeSum / stats.groupsProcessed / 1000}`).toFixed(2)}s`,
                );
                logger.info(
                    `Removed: ${stats.removed} | Updated: ${stats.updated} | Created: ${stats.added}`,
                );
            }
        };

        // Starting to update the first group
        logger.info(
            `${allGroups.length} groups will be processed each ${intervalBetweenGroups}ms`,
        );
        scheduleNextGroup();
    }
}

const coursesService = new CoursesService();

export { coursesService };
