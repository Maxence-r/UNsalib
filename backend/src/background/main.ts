import "dotenv/config";
import cron from "node-cron";
import { Types } from "mongoose";

// import { processGroups } from "./groups.js";
import { fetchGroupCourses } from "./courses.js";
import { appConfig } from "../configs/app.config.js";
import { logger } from "../utils/logger.js";
import { publishAvailableRooms } from "./refresh-available.js";
import { sectorsService } from "../services/sectors.service.js";
import { CoursesFetchError } from "./courses.js";
import { GroupSchemaProperties } from "../models/group.model.js";
import { groupsService } from "../services/groups.service.js";
import { dataConfig } from "configs/data.config.js";
import { campusesService } from "services/campuses.service.js";
import { coursesService } from "services/courses.service.js";

async function syncTimetables(force = false): Promise<void> {
    const allGroups: {
        details: GroupSchemaProperties & { _id: Types.ObjectId };
        campusId: string;
    }[] = [];

    const campuses = await campusesService.getAll();
    for (const campus of campuses) {
        const groups = await groupsService.getGroupsForCampus(campus._id);

        for (const group of groups) {
            allGroups.push({ details: group, campusId: campus._id });
        }
    }

    // Processing stats storage
    const stats = {
        timeSum: 0,
        groupsProcessed: 0,
        removed: 0,
        added: 0,
        updated: 0,
    };

    // Calculating the interval between each group for a uniform distribution
    // If force is true, the the interval is 0 to fetch immediately
    const intervalBetweenGroups = force
        ? 0
        : (appConfig.tasks.syncInterval / allGroups.length) * 60 * 60 * 1000;

    let groupIndex = 0;

    const scheduleNextGroup = (): void => {
        if (groupIndex < allGroups.length) {
            const syncGroupTimetable = async (): Promise<void> => {
                const group = allGroups[groupIndex];

                try {
                    // Save the start time to get the processing time
                    const startProcessingTime = Date.now();

                    const results = await fetchGroupCourses(
                        group.details,
                        group.campusId,
                    );

                    // Calculate new stats
                    stats.timeSum += Date.now() - startProcessingTime;
                    stats.added += results.created;
                    stats.updated += results.updated;
                    stats.removed += results.removed;
                    stats.groupsProcessed++;
                } catch (e) {
                    if (e instanceof CoursesFetchError) {
                        logger.error(
                            `Cannot retrieve timetable for the ${e.groupName} group (univId: ${e.groupUnivId}, url: ${e.url}): ${e.message}`,
                        );
                    }
                }

                // Recursively call the next iteration
                groupIndex++;
                scheduleNextGroup();
            };

            setTimeout(() => void syncGroupTimetable(), intervalBetweenGroups);
        } else {
            // All groups were processed
            logger.info(
                `${stats.groupsProcessed} groups processed | Average processing time: ${parseFloat(`${stats.timeSum / stats.groupsProcessed / 1000}`).toFixed(2)}s`,
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

async function launchBackgroundTasks(): Promise<void> {
    await campusesService.init(
        dataConfig.campuses.map((campus) => campus.name),
    );
    await sectorsService.init(dataConfig.campuses);

    if (
        appConfig.tasks.forceGroupsFetch ||
        (await groupsService.getAll()).length === 0
    ) {
        if (!appConfig.tasks.forceGroupsFetch)
            logger.info("Detected that there are no groups in the database");
        logger.info("Forcing groups fetch");
        await groupsService.sync(await sectorsService.getAll());
    }

    if (appConfig.tasks.forceTimetablesSync) {
        logger.info("Starting timetables force sync");
        await coursesService.syncAll(true);
    }

    if (appConfig.tasks.syncTimetables) {
        // Scheduling sync each day each specified hour interval
        const hours = [...Array(24 / appConfig.tasks.syncInterval).keys()].map(
            (v) => v * appConfig.tasks.syncInterval,
        );

        cron.schedule(`0 ${hours.join(",")} * * *`, async () => {
            logger.info("Starting a new timetables sync cycle");
            await coursesService.syncAll(true);
        });
    }

    // void publishAvailableRooms();
}

export { launchBackgroundTasks };
