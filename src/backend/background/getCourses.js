import Groupe from '../models/groupe.js';
import Cours from '../models/cours.js';
import Salle from '../models/salle.js';
import 'dotenv/config';
import { closestPaletteColor } from '../utils/color.js';
import io from '../../../server.js';

// CONSTANTS
// Groups update interval in milliseconds
const CYCLE_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
// Number of days to fetch for each timetable
const DAYS_TO_RETRIEVE = 90; // 3 weeks

// Gets the start and end dates for the request to the timetable website
function getRequestDates(increment) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + increment);
    startDate.setDate(startDate.getDate() - 1);

    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
}

// Processes a room to add it to the database if it not already exists
async function processRoom(roomName) {
    // Checking if the room name is valid
    if (!roomName) return null;

    // Formatting the room and building names
    const formattedRoom = roomName.includes('(')
        ? roomName.split('(')[0].trim()
        : roomName.trim();
    const formattedBuilding = roomName.includes('(')
        ? roomName.split('(')[1].split(')')[0]
        : roomName;

    // Trying to find the room in the database
    let room = await Salle.findOne({ nom_salle: formattedRoom });

    // if the room does not exist, create a new record
    if (!room) {
        room = new Salle({
            nom_salle: formattedRoom,
            batiment: formattedBuilding,
            places_assises: 0,
        });
        await room.save();
        console.log(`\r\x1b[KNouvelle salle ajoutée : ${formattedRoom} (${formattedBuilding})`);
    }

    return room;
}

// Processes a course to add it to the database if it not already exists
async function processCourse(courseData) {
    // Getting rooms and then the main room
    const rooms = courseData.rooms_for_blocks.split(';');
    const mainRoom = await processRoom(rooms[0]);

    // Checking if data is valid
    if (!courseData.start_at || !courseData.end_at || !courseData.rooms_for_blocks || !mainRoom._id) {
        return;
    }

    // Checking if the course already exists in the database
    const courseExists = await Cours.exists({
        classe: mainRoom?._id,
        debute_a: courseData.start_at,
        fini_a: courseData.end_at,
    });
    if (courseExists) return;

    // If the course doesn't exists, create it the database
    const newCourse = new Cours({
        identifiant: courseData.id,
        debute_a: courseData.start_at,
        fini_a: courseData.end_at,
        professeur: courseData.teachers_for_blocks || 'Non renseigné',
        classe: mainRoom?._id || 'Non renseigné',
        module: courseData.modules_for_blocks || 'Non renseigné',
        groupe: courseData.educational_groups_for_blocks.split(';').map((item) => item.trim()) || 'Non renseigné',
        couleur: closestPaletteColor(courseData.color) || '#FF7675',
    });

    await newCourse.save();
}

// Retrieves courses for a group
async function fetchCourses(group) {
    // Getting dates for the specified amount of time
    const dates = getRequestDates(DAYS_TO_RETRIEVE);

    process.stdout.write(`\r\x1b[KRécupération des cours pour le groupe ${group.nom} du ${dates.start} au ${dates.end}`);

    // Building request URL
    const requestUrl = `https://edt-v2.univ-nantes.fr/events?start=${dates.start}&end=${dates.end}&timetables%5B%5D=${group.identifiant}`;

    try {
        // Getting data from the Nantes Université timetable API
        const response = await fetch(requestUrl);
        const jsonData = await response.json();

        // Processing each course
        for (const course of jsonData) {
            await processCourse(course);
        }

        // Sending an update message to all clients
        io.emit('groupUpdated', { message: `Groupe ${group.nom} mis à jour` });
    } catch (error) {
        console.error(`Erreur pour le groupe ${group.nom} (id : ${group.identifiant}, url : ${requestUrl}) :`, error);
    }
}

// Processes a batch of groups
async function processBatchGroups(groups) {
    for (const group of groups) {
        await fetchCourses(group);
    }
}

// Main
async function getCourses() {
    const groups = await Groupe.find();

    // If 'FORCER_TRAITEMENT_GPES' is activated, process all groups immediately
    if (process.env.FORCER_TRAITEMENT_GPES === 'true') {
        console.log('Traitement de tous les groupes ACTIVÉ - Démarrage du processus...');
        await processBatchGroups(groups);
    } else {
        console.log('Traitement de tous les groupes DÉSACTIVÉ');
    }

    // Calculating the interval between each group for a CYCLE_INTERVAL-hour distribution
    const groupsNumber = groups.length;
    const intervalBetweenGroups = Math.floor(CYCLE_INTERVAL / groupsNumber);

    // Function to start the update cycle
    const startUpdateCycle = () => {
        let groupIndex = 0;

        // Function to schedule the next group to update
        const scheduleNextGroup = () => {
            if (groupIndex < groupsNumber) {
                setTimeout(async () => {
                    const group = groups[groupIndex];
                    await getCourses(group);
                    groupIndex++;
                    scheduleNextGroup();
                }, intervalBetweenGroups);
            } else { // all groups were processed
                // Resetting the group index for the next cycle
                groupIndex = 0;
                setTimeout(() => {
                    console.log('Démarrage d\'un nouveau cycle de 12h');
                    scheduleNextGroup();
                }, intervalBetweenGroups);
            }
        };

        // Starting to update the first group 
        scheduleNextGroup();
    };

    // Starting the update process
    console.log('Démarrage du cycle de mise à jour...');
    console.log(`${groupsNumber} groupes seront traités toutes les ${CYCLE_INTERVAL / 1000 / 60 / 60}h`);
    console.log(`Intervalle entre chaque groupe : ${intervalBetweenGroups / 1000} secondes`);
    startUpdateCycle();
}

export default getCourses;