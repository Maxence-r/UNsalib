import  Groupe from '../models/groupe.js';
import { parse } from 'node-html-parser';
import { getCourses } from './getCourses.js';
import 'dotenv/config'

const TIMETABLES_URL = 'https://edt-v2.univ-nantes.fr/sciences/educational_groups';

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

async function getGroups() {
    if (process.env.FORCER_RECUP_GPES === 'false') {
        console.log('Récupération des groupes DÉSACTIVÉE');
        return getCourses();
    }
    console.log('Récupération des groupes ACTIVÉE - Démarrage du processus...');
    await Groupe.deleteMany({});
    const page = await getHTML(TIMETABLES_URL);
    if (page !== -1) {
        const docRoot = parse(page);
        const groupsInputs = docRoot.querySelectorAll('#desktopGroupForm #educational_groups input');
        for (const input of groupsInputs) {
            // Gets the id of each checkbox that contains the timetable id
            const group = input.id.replace('desktop-timetable-', '');
            const exists = await Groupe.exists({ identifiant: group });
            if (!exists) {
                const groupObj = new Groupe({
                    identifiant: group,
                    nom: input.nextElementSibling.textContent.trim()
                });
                await groupObj.save();
                process.stdout.write(groupsInputs.indexOf(input) + 1 + '/' + groupsInputs.length + ' obtenus' + '\r');
            }
        }
            
        getCourses();
    } else { // there is an error when fetching groups
        console.error('Erreur lors de la récupération des groupes.');
    }
}

export default getGroups;