import { parse } from "node-html-parser";

import { logger } from "../utils/logger.js";
import { config } from "configs/data.config.js";
import { groupsService } from "../services/groups.service.js";
import { campusesService } from "../services/campuses.service.js";

// Main function to fetch and update groups from the university timetable page
async function getGroups(): Promise<void> {
    for (const campus of config.campus) {
        for (const timetableId of campus.timetableIds) {
            try {
                // Getting the timetable HTML page
                const page = await fetch(
                    config.baseUrl + timetableId + "/educational-groups",
                );
                const html = await page.text(); // converting the response into plain text

                // Parse the HTML to extract groups checkboxes
                const docRoot = parse(html);

                const groupsInputs = docRoot.querySelectorAll(
                    "#desktopGroupForm #educational_groups input",
                );

                let added = 0;
                let modified = 0;

                const campusId = await campusesService.getCampusByName(
                    campus.name,
                );
                if (!campusId) {
                    logger.error(
                        `Campus ID not found for campus: ${campus.name}`,
                    );
                    continue;
                }
                let existingGroups =
                    await groupsService.getGroupsForCampus(campusId);

                // First loop: clear the univId arrays for existing groups and collect new group info
                logger.info("Starting groups analysis");
                for (const input of groupsInputs) {
                    // Get the ID and name for each group checkbox
                    const groupId = input.getAttribute("value");
                    const labelElement = docRoot.querySelector(`label[for="${input.id}"]`);
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

                for (const existingGroup of existingGroups) {
                    // Remaining existing groups are no longer present, delete them
                    await groupsService.deleteGroup(
                        existingGroup.univId,
                        campusId,
                    );
                }

                logger.info(`Added ${added} groups`);
                logger.info(`Updated ${modified} groups`);
                logger.info(`Deleted ${existingGroups.length} groups`);
            } catch (error) {
                // There was an error when fetching groups
                logger.error("Error when fetching groups:", error);
            }
        }
    }
}

export default getGroups;
