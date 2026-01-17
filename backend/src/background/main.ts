import "dotenv/config";

import { processGroups } from "./groups.js";
import { getCourses, processBatchGroups } from "./courses.js";
import { config } from "../configs/app.config.js";
import { logger } from "../utils/logger.js";
import { publishAvailableRooms } from "./refresh-available.js";
import { initCampuses } from "./campuses.js";

async function launchBackgroundTasks(): Promise<void> {
    await initCampuses();

    if (config.tasks.forceGroupsFetch) {
        logger.info("Starting groups force fetch");
        await processGroups();
    }

    // if (config.tasks.forceTimetablesFetch) {
    //     logger.info("Starting timetables force fetch");
    //     await processBatchGroups();
    // }

    // if (config.tasks.syncTimetables) {
    //     logger.info("Starting timetables sync");
    //     void getCourses();
    // }

    // processGroup("387");
    void publishAvailableRooms();
}

export { launchBackgroundTasks };
