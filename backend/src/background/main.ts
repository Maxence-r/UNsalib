import "dotenv/config";

import getGroups from "./getGroups.js";
import { getCourses, processBatchGroups } from "./getCourses.js";
import { config } from "../configs/app.config.js";
import { logger } from "utils/logger.js";

async function launchBackgroundTasks(): Promise<void> {
    if (config.tasks.forceGroupsFetch) {
        logger.info("Starting groups force fetch");
        await getGroups();
    }

    if (config.tasks.forceTimetablesFetch) {
        logger.info("Starting timetables force fetch");
        await processBatchGroups();
    }

    if (config.tasks.syncTimetables) {
        logger.info("Starting timetables sync");
        void getCourses();
    }

    // processGroup("387");
}

export { launchBackgroundTasks };
