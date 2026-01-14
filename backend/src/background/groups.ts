import { parse } from "node-html-parser";

import { logger } from "../utils/logger.js";
import { config } from "configs/data.config.js";
import { groupsService } from "../services/groups.service.js";
import { campusesService } from "../services/campuses.service.js";

// Main function to fetch and update groups from the university timetable page
async function getGroups(): Promise<void> {
    for (const campus of config.campus) {
        logger.info(`Starting groups analysis for ${campus.name}`);

        const campusId = await campusesService.getCampusByName(campus.name);
        if (!campusId) {
            logger.error(`Campus ID not found for campus: ${campus.name}`);
            continue;
        }

        let existingGroups = await groupsService.getGroupsForCampus(campusId);

        let added = 0;
        let modified = 0;

        for (const timetableId of campus.timetableIds) {
            try {
                // Get the timetable HTML page
                const page = await fetch(
                    `${config.baseUrl}/${timetableId}/educational_groups`,
                );
                // Parse the HTML to extract groups checkboxes
                const docRoot = parse(await page.text());
                const groupInputs = docRoot.querySelectorAll(
                    "#desktopGroupForm #educational_groups input",
                );

                for (const input of groupInputs) {
                    // Get the ID and name for each group checkbox
                    const groupId = input.getAttribute("value");
                    const labelElement = docRoot.querySelector(
                        `label[for="${input.id}"]`,
                    );
                    const groupName = labelElement?.textContent.trim();

                    if (!groupId || !groupName) continue;

                    if (existingGroups.find((g) => g.univId === groupId)) {
                        // Group exists, check if the name needs to be updated
                        const existingGroup = existingGroups.find(
                            (g) => g.univId === groupId,
                        );
                        if (existingGroup && existingGroup.name !== groupName) {
                            await groupsService.updateName(
                                groupId,
                                campusId,
                                groupName,
                            );
                            modified++;
                            existingGroups = existingGroups.filter(
                                (g) => g.univId !== groupId,
                            );
                        }
                    } else {
                        // New group, add it to the database
                        await groupsService.addGroup(
                            groupId,
                            campusId,
                            groupName,
                        );
                        added++;
                    }
                }
            } catch (error) {
                // There was an error when fetching groups
                logger.error("Error when fetching groups:", error);
            }
        }

        for (const existingGroup of existingGroups) {
            // Remaining existing groups are no longer present, delete them
            await groupsService.deleteGroup(existingGroup.univId, campusId);
        }

        logger.info(`Added ${added} groups`);
        logger.info(`Updated ${modified} groups`);
        logger.info(`Deleted ${existingGroups.length} groups`);
    }
}

export { getGroups };
