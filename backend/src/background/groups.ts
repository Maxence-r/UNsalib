import { parse } from "node-html-parser";
import { Types } from "mongoose";

import { logger } from "../utils/logger.js";
import { config } from "../configs/data.config.js";
import { groupsService } from "../services/groups.service.js";
import { campusesService } from "../services/campuses.service.js";
import { GroupSchemaProperties } from "../models/group.model.js";

interface ExtractedGroupInfos {
    id: number;
    name: string;
}

class CampusIdNotFoundError extends Error {}

async function extractGroupsFromTimetablePage(
    url: string,
): Promise<ExtractedGroupInfos[]> {
    // Get the timetable HTML page
    const page = await fetch(url);

    // Parse the HTML to extract groups checkboxes
    const docRoot = parse(await page.text());
    const groupInputs = docRoot.querySelectorAll(
        "#desktopGroupForm #educational_groups input",
    );

    const foundGroups: ExtractedGroupInfos[] = [];

    for (const input of groupInputs) {
        // Get the ID and name for each group checkbox
        const groupId = parseInt(input.getAttribute("value") || "");
        const labelElement = docRoot.querySelector(`label[for="${input.id}"]`);
        const groupName = labelElement?.textContent.trim();

        if (!isNaN(groupId) && groupName) {
            foundGroups.push({
                id: groupId,
                name: groupName,
            });
        }
    }

    return foundGroups;
}

async function processExtractedGroups(
    campusId: Types.ObjectId,
    existingGroups: (GroupSchemaProperties & { _id: Types.ObjectId })[],
    extractedGroups: ExtractedGroupInfos[],
): Promise<{
    added: number;
    updated: number;
    existingGroups: (GroupSchemaProperties & { _id: Types.ObjectId })[];
}> {
    let added = 0;
    let updated = 0;

    for (const group of extractedGroups) {
        const existingGroup = existingGroups.find((g) => g.univId === group.id);

        if (existingGroup) {
            // Group exists, check if the name needs to be updated
            if (existingGroup.name !== group.name) {
                await groupsService.updateNameByUnivId(
                    group.id,
                    campusId,
                    group.name,
                );

                updated++;
            }

            // Remove the processed group from the available groups array
            existingGroups = existingGroups.filter(
                (g) => g.univId !== group.id,
            );
        } else {
            // New group, add it to the database
            await groupsService.addGroup(group.id, campusId, group.name);
            added++;
        }
    }

    return { added, updated, existingGroups };
}

async function processGroupsByCampus(
    campusName: string,
    sectorIds: string[],
): Promise<{ added: number; updated: number; deleted: number }> {
    let existingGroups = await groupsService.getGroupsForCampus(campusName);

    let totalAdded = 0;
    let totalUpdated = 0;

    for (const sectorId of sectorIds) {
        const extractedGroups = await extractGroupsFromTimetablePage(
            `${config.baseUrl}/${sectorId}/educational_groups`,
        );

        const results = await processExtractedGroups(
            campusId,
            existingGroups,
            extractedGroups,
        );

        totalAdded += results.added;
        totalUpdated += results.updated;
        existingGroups = results.existingGroups;
    }

    for (const existingGroup of existingGroups) {
        // Remaining existing groups are no longer present, delete them
        await groupsService.deleteGroup(existingGroup._id);
    }

    return {
        added: totalAdded,
        updated: totalUpdated,
        deleted: existingGroups.length,
    };
}

// Main function to fetch and update groups from the university timetable page
async function processGroups(): Promise<void> {
    for (const campus of config.campus) {
        try {
            logger.info(
                `Starting processing of the ${campus.name} campus groups`,
            );

            const results = await processGroupsByCampus(
                campus.name,
                campus.sectorIds,
            );

            logger.info(`Added ${results.added} groups`);
            logger.info(`Updated ${results.updated} groups`);
            logger.info(`Deleted ${results.deleted} groups`);
        } catch (e) {
            const baseError = `Error when processing groups of the ${campus.name} campus: `;

            if (e instanceof CampusIdNotFoundError) {
                logger.error(baseError + "unknown campus ID");
            } else if (e instanceof Error) {
                logger.error(baseError + e.message);
            } else {
                logger.error(baseError + "unknown error");
            }
        }
    }

    logger.info("Groups processing successful");
}

export { processGroups, extractGroupsFromTimetablePage, processExtractedGroups };
