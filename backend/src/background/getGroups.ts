import { parse } from "node-html-parser";

import Group from "../models/group.js";

// CONSTANTS
// The URL to get the timetable page
const TIMETABLE_URL =
    "https://edt-v2.univ-nantes.fr/sciences/educational_groups";

// Fetches the HTML content from the provided URL
async function getHTML(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const html = await response.text(); // converting the response into plain text
        return html;
    } catch (error) {
        console.error(
            `Erreur lors de l'obtention de la page ${url}: ${error as string}`,
        );
        return null;
    }
}

// Main function to fetch and update groups from the university timetable page
async function getGroups(): Promise<void> {
    // Getting the timetable HTML page
    const page = await getHTML(TIMETABLE_URL);

    if (page) {
        // Parse the HTML to extract groups checkboxes
        const docRoot = parse(page);
        const groupsInputs = docRoot.querySelectorAll(
            "#desktopGroupForm #educational_groups input",
        );

        let added = 0;
        let modified = 0;

        // First loop: clear the univId arrays for existing groups and collect new group info
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

            process.stdout.write(
                `${groupsInputs.indexOf(input) + 1}/${groupsInputs.length} analysés\r`,
            );
        }

        // Second loop: add new groups or update existing ones with new univId, and set
        // the 'current' flag to true (it is false by default), so old groups are kept
        // to maintain links to existing events but will not be used to obtain new courses
        for (const newGroup of newGroups) {
            const existingRecord = await Group.findOne({ name: newGroup.name });

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

            process.stdout.write(
                `${newGroups.indexOf(newGroup) + 1}/${newGroups.length} traités             \r`,
            );
        }
        console.log(`Ajoutés : ${added} | Mis à jour : ${modified}`);
    } else {
        // there was an error when fetching groups
        console.error("Erreur lors de la récupération des groupes.");
    }
}

export default getGroups;
