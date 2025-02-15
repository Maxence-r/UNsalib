import Group from '../models/group.js';
import { parse } from 'node-html-parser';

// CONSTANTS
// The URL to get the timetable page
const TIMETABLE_URL = 'https://edt-v2.univ-nantes.fr/sciences/educational_groups';

// Gets the HTML from an URL
async function getHTML(url) {
    try {
        const response = await fetch(url);
        const html = await response.text(); // converting the response into plain text
        return html;
    } catch (error) {
        console.error('Erreur lors de l\'obtention de la page ', url, ':', error)
        return -1;
    }
}

// Main
async function getGroups() {
    // Deleting all the stored groups
    await Group.deleteMany({});

    // Getting the timetable HTML page
    const page = await getHTML(TIMETABLE_URL);

    if (page !== -1) {
        // Parsing the HTML to extract the groups checkboxes with their ids
        const docRoot = parse(page);
        const groupsInputs = docRoot.querySelectorAll('#desktopGroupForm #educational_groups input');

        for (const input of groupsInputs) {
            // Getting the id of each checkbox
            const group = input.id.replace('desktop-timetable-', '');
            const exists = await Group.exists({ univId: group });

            // If the group is not in the database, store it
            if (!exists) {
                const groupObj = new Group({
                    univId: group,
                    name: input.nextElementSibling.textContent.trim()
                });
                await groupObj.save();
                process.stdout.write(groupsInputs.indexOf(input) + 1 + '/' + groupsInputs.length + ' obtenus' + '\r');
            }
        }
    } else { // there is an error when fetching groups
        console.error('Erreur lors de la récupération des groupes.');
    }
}

export default getGroups;