import Group from '../models/group.js';
import Course from '../models/course.js';
import Room from '../models/room.js';
import 'dotenv/config';
import { closestPaletteColor } from '../utils/color.js';
import io from '../../../server.js';

// CONSTANTS
// Groups update interval in milliseconds
const CYCLE_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
// Number of days to fetch for each timetable
const DAYS_TO_RETRIEVE = 90; // 3 weeks
// Storage of the average processing time for each group
let averageProcessingTime = { timeSum: 0, measuresNumber: 0 };

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
    if (!roomName) return;

    // Formatting the room and building names
    const formattedRoom = roomName.includes('(')
        ? roomName.split('(')[0].trim()
        : roomName.trim();
    const formattedBuilding = roomName.includes('(')
        ? roomName.split('(')[1].split(')')[0]
        : roomName;

    // Trying to find the room in the database
    let room = await Room.findOne({ name: formattedRoom });

    // If the room does not exist, create a new record
    if (!room) {
        room = new Room({
            name: formattedRoom,
            seats: 0,
            building: formattedBuilding
        });
        await room.save();
        console.log(`\r\x1b[KNouvelle salle ajoutée : ${formattedRoom} (${formattedBuilding})`);
    }

    return room;
}

// Processes all the courses in a given group to perform add/remove/update operations in our database
async function processGroupCourses(univData, dbData, groupInfos) {
    // Parses our database's raw course data and returns a standardized array
    async function parseUnivData(univData) {
        return await Promise.all(univData.map(async (courseData) => {
            function splitAndSortBlocks(blocks) {
                if (blocks && blocks !== '') {
                    return blocks.split(';').map(item => item.trim()).sort();
                }
                return [];
            }
            
            let rooms = splitAndSortBlocks(courseData.rooms_for_blocks);
            let teachers = splitAndSortBlocks(courseData.teachers_for_blocks);
            let modules = splitAndSortBlocks(courseData.modules_for_blocks);
            return JSON.stringify({
                id: courseData.id.toString(),
                category: courseData.categories || '',
                start: courseData.start_at,
                end: courseData.end_at,
                notes: courseData.notes || '',
                rooms: rooms,
                teachers: teachers,
                modules: modules
            });
        }));
    }

    // Parses the university's raw course data and returns a standardized array
    async function parseDbData(dbData) {
        return await Promise.all(dbData.map(async (courseData) => {
            let rooms = await Promise.all(courseData.rooms.map(async (roomId) => {
                let room = await Room.findOne({ _id: roomId });
                return `${room.name} (${room.building})`;
            }));
            rooms.sort();
            let modules = courseData.modules.sort(), teachers = courseData.teachers.sort();
            return JSON.stringify({
                id: courseData.univId.toString(),
                category: courseData.category,
                start: courseData.start,
                end: courseData.end,
                notes: courseData.notes,
                rooms: rooms,
                teachers: teachers,
                modules: modules
            });
        }));
    }

    // Replaces the common elements of 2 arrays with empty objects
    function removeCommonElements(array1, array2) {
        const filteredArray1 = array1.map((item) => array2.includes(item) ? '{}' : item);
        const filteredArray2 = array2.map((item) => array1.includes(item) ? '{}' : item);
        return [filteredArray1, filteredArray2];
    }

    // Transforming the data obtained from the Nantes Université API and 
    // the data in the database so that they are in the same format
    let jsonParsedUnivData = await parseUnivData(univData);
    let jsonParsedDBData = await parseDbData(dbData);

    // Removing identical courses from both arrays
    const filteredArrays = removeCommonElements(jsonParsedUnivData, jsonParsedDBData);
    jsonParsedUnivData = filteredArrays[0], jsonParsedDBData = filteredArrays[1];

    // Browsing the courses remaining in our database (to be deleted from our database)
    let jsonCourse;
    for (let index = 0; index < jsonParsedDBData.length; index++) {
        jsonCourse = jsonParsedDBData[index];
        if (jsonCourse != '{}') {
            if (dbData[index].groups.length > 1) {
                // If there are several groups in the course record, modify it by just deleting the group
                let updatedCourse = dbData[index];
                updatedCourse.groups.splice(updatedCourse.groups.indexOf(groupInfos._id.toString()), 1);
                await Course.findOneAndUpdate({ _id: updatedCourse._id }, {
                    $set: { groups: updatedCourse.groups }
                });
            } else {
                // If there is only one group in the course record, delete it
                await Course.deleteOne({ _id: dbData[index]._id });
            }
        }
    }
    // Browsing courses that remain in the university's data (new to our database)
    for (let index = 0; index < jsonParsedUnivData.length; index++) {
        jsonCourse = jsonParsedUnivData[index];
        if (jsonCourse != '{}') {
            let course = JSON.parse(jsonCourse);
            const courseData = univData[index];

            // Checking if data is valid (e.g: excludes holidays with no associated rooms)
            if (!courseData.start_at || !courseData.end_at || !courseData.id || !courseData.celcat_id || !courseData.rooms_for_blocks) continue;

            // Checking if the course already exists in the database
            const existingCourse = await Course.findOne({
                univId: courseData.id,
                start: courseData.start_at,
                end: courseData.end_at,
            });

            if (existingCourse === null || existingCourse === undefined) {
                // If the course doesn't exists, create it the database
                const rooms = await Promise.all(course.rooms.map(async (roomName) => (await processRoom(roomName))._id));
                const newCourse = new Course({
                    univId: courseData.id,
                    celcatId: courseData.celcat_id,
                    category: courseData.categories || '',
                    start: courseData.start_at,
                    end: courseData.end_at,
                    notes: courseData.notes || '',
                    color: closestPaletteColor(courseData.color) || '#FF7675',
                    rooms: rooms,
                    teachers: course.teachers,
                    groups: [groupInfos._id],
                    modules: course.modules
                });
                await newCourse.save();
            } else {
                // If the course exists, add this group to its record
                await Course.findOneAndUpdate({ _id: existingCourse._id }, {
                    $push: { groups: groupInfos._id }
                });
            }
        }
    }
}

// Retrieves courses for a group
async function fetchCourses(group) {
    // Saving the start date
    const startProcessingTime = new Date();

    // Getting dates for the specified amount of time
    const dates = getRequestDates(DAYS_TO_RETRIEVE);

    process.stdout.write(`\r\x1b[KRécupération des cours pour le groupe ${group.name} du ${dates.start} au ${dates.end} (tps moy de traitement : ${parseFloat('' + ((averageProcessingTime.timeSum / averageProcessingTime.measuresNumber) / 1000)).toFixed(2)}s)`);

    // Building request URL
    const requestUrl = `https://edt-v2.univ-nantes.fr/events?start=${dates.start}&end=${dates.end}&timetables%5B%5D=${group.univId}`;

    try {
        // Getting data from the Nantes Université timetable API
        const response = await fetch(requestUrl);
        const jsonData = await response.json();

        // Getting some related data from our database
        const groupInfos = await Group.findOne({ name: group.name });
        const dbRecords = await Course.find({
            start: { $gte: dates.start + 'T00:00:00+01:00' },
            end: { $lte: dates.end + 'T23:59:59+01:00' },
            groups: groupInfos._id
        });

        // Processing all the courses for this group
        await processGroupCourses(jsonData, dbRecords, groupInfos);

        // Sending an update message to all clients
        io.emit('groupUpdated', { message: `Groupe ${group.name} mis à jour` });

        // Calculating the new average processing time
        const processingTime = new Date() - startProcessingTime;
        averageProcessingTime.timeSum += processingTime;
        averageProcessingTime.measuresNumber++;
    } catch (error) {
        console.error(`Erreur pour le groupe ${group.name} (id : ${group.univId}, url : ${requestUrl}) :`, error);
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
    const groups = await Group.find();

    // If 'FORCER_TRAITEMENT_GPES' is activated, process all groups immediately
    if (process.env.FORCER_TRAITEMENT_GPES === 'true') {
        console.log('Traitement de tous les groupes ACTIVÉ - Démarrage du processus...');
        await processBatchGroups(groups);
        averageProcessingTime = { timeSum: 0, measuresNumber: 0 };
    } else {
        console.log('Traitement de tous les groupes DÉSACTIVÉ');
    }

    // Calculating the interval between each group for a CYCLE_INTERVAL-hour distribution
    const groupsNumber = groups.length;
    const intervalBetweenGroups = Math.floor(CYCLE_INTERVAL / groupsNumber);

    // Function to start the update cycle
    function startUpdateCycle() {
        let groupIndex = 0;

        // Function to schedule the next group to update
        const scheduleNextGroup = () => {
            if (groupIndex < groupsNumber) {
                setTimeout(async () => {
                    const group = groups[groupIndex];
                    await fetchCourses(group);
                    groupIndex++;
                    scheduleNextGroup();
                }, intervalBetweenGroups);
            } else { // all groups were processed
                // Resetting the group index for the next cycle
                groupIndex = 0;
                setTimeout(() => {
                    console.log('Démarrage d\'un nouveau cycle de 12h');
                    averageProcessingTime = { timeSum: 0, measuresNumber: 0 };
                    scheduleNextGroup();
                }, intervalBetweenGroups);
            }
        };

        // Starting to update the first group 
        scheduleNextGroup();
    };

    // Starting the update process
    console.log('\nDémarrage du cycle de mise à jour...');
    console.log(`${groupsNumber} groupes seront traités toutes les ${CYCLE_INTERVAL / 1000 / 60 / 60}h`);
    console.log(`Intervalle entre chaque groupe : ${intervalBetweenGroups / 1000} secondes`);
    startUpdateCycle();
}

export default getCourses;