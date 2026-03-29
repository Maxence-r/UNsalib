import "dotenv/config";
import cron from "node-cron";

import { appConfig } from "../configs/app.config.js";
import { logger } from "../utils/logger.js";
// import { publishAvailableRooms } from "./refresh-available.js";
import { sectorsService } from "../services/sectors.service.js";
import { groupsService } from "../services/groups.service.js";
import { dataConfig } from "configs/data.config.js";
import { campusesService } from "services/campuses.service.js";
import { coursesService } from "services/courses.service.js";

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
        await coursesService.syncAll(0, appConfig.tasks.daysToRetrieve);
    }

    if (appConfig.tasks.syncTimetables) {
        // Scheduling sync each day each specified hour interval
        const hours = [...Array(24 / appConfig.tasks.syncInterval).keys()].map(
            (v) => v * appConfig.tasks.syncInterval,
        );

        cron.schedule(`0 ${hours.join(",")} * * *`, async () => {
            logger.info("Starting a new timetables sync cycle");
            await coursesService.syncAll(
                appConfig.tasks.syncInterval,
                appConfig.tasks.daysToRetrieve,
            );
        });
    }

    // void publishAvailableRooms();
}

export { launchBackgroundTasks };
