import { parse } from "node-html-parser";

import { Group } from "../models/group.js";
import { logger } from "../utils/logger.js";

// CONSTANTS
// The URL to get the timetable page
const TIMETABLE_URL =
    "https://edt-v2.univ-nantes.fr/sciences/educational_groups";

// Main function to fetch and update groups from the university timetable page
async function getGroups(): Promise<void> {
    try {
        // Getting the timetable HTML page
        const page = await fetch(TIMETABLE_URL);
        const html = await page.text(); // converting the response into plain text

        // Parse the HTML to extract groups checkboxes
        const docRoot = parse(html);

        const groupsInputs = docRoot.querySelectorAll(
            "#desktopGroupForm #educational_groups input",
        );

        let added = 0;
        let modified = 0;

        // First loop: clear the univId arrays for existing groups and collect new group info
        logger.info("Starting groups analysis");
        const newGroups = [];
        for (const input of groupsInputs) {
            // Get the ID and name for each group checkbox
            const groupId = input.getAttribute("value");
            const groupName = docRoot
                .querySelector(`label[for="${input.id}"]`)
                .textContent.trim();

            // If the group already exists, reset its univId array
            const existingRecord = await Group.findOne({ name: groupName });
            if (existingRecord) {
                await Group.updateOne(
                    { _id: existingRecord._id },
                    {
                        univId: [],
                    },
                );
            }

            // Store the group info for the next step
            newGroups.push({
                id: groupId,
                name: groupName,
            });
        }

        // Second loop: add new groups or update existing ones with new univId, and set
        // the 'current' flag to true (it is false by default), so old groups are kept
        // to maintain links to existing events but will not be used to obtain new courses
        logger.info("Starting groups processing");
        for (const newGroup of newGroups) {
            const existingRecord = await Group.findOne({
                name: newGroup.name,
            });

            if (!existingRecord) {
                // Add new group to the database
                const newGroupRecord = new Group({
                    univId: [newGroup.id],
                    name: newGroup.name,
                    current: true,
                });
                await newGroupRecord.save();
                added += 1;
            } else if (
                existingRecord.name === newGroup.name &&
                !existingRecord.univId.includes(newGroup.id)
            ) {
                // Update existing group with new univId if not already present
                await Group.updateOne(
                    { _id: existingRecord._id },
                    {
                        $push: { univId: newGroup.id },
                        current: true,
                    },
                );
                modified += 1;
            }
        }
        logger.info(`Added ${added} groups`);
        logger.info(`Updated ${modified} groups`);
    } catch (error) {
        // There was an error when fetching groups
        logger.error("Error when fetching groups:", error);
    }
}

export default getGroups;
