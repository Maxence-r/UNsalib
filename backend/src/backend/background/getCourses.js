import Group from '../models/group.js';
import Course from '../models/course.js';
import Room from '../models/room.js';
import 'dotenv/config';
import { closestPaletteColor } from '../utils/color.js';
import wsManager from '../../../server.js';

// CONSTANTS
// Groups update interval in milliseconds
const CYCLE_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
// Number of days to fetch for each timetable
const DAYS_TO_RETRIEVE = 125;
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

// Splits a string present in the data supplied by the University 
// (blocks separated by ‘;’) and returns an array of elements 
function splitUnivDataBlocks(blocks) {
    if (blocks && blocks !== '') {
        return blocks.split(';').map(item => item.trim());
    }
    return [];
}

async function isDbCourseInUnivArray(dbCourse, univDataArray) {
    // Checks if two arrays are the same
    // Adapted from https://stackoverflow.com/a/16436975
    function areArraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        let a1 = a.sort();
        let b1 = b.sort();

        for (var i = 0; i < a1.length; ++i) {
            if (a1[i] !== b1[i]) return false;
        }
        return true;
    }

    // Processing the dbCourse's rooms, teachers and modules to put them into a convenient format
    let dbRooms = await Promise.all(dbCourse.rooms.map(async (roomId) => {
        let room = await Room.findOne({ _id: roomId });
        return room.name == room.building ? `${room.name}` : `${room.name} (${room.building})`;
    }));
    let dbModules = dbCourse.modules;
    let dbTeachers = dbCourse.teachers;

    // Checking if our DB course is present in the University data
    let univRooms, univTeachers, univModules;
    for (let i = 0; i < univDataArray.length; i++) {
        const univCourse = univDataArray[i];

        // Processing the univCourse's rooms, teachers and modules to put them into the same format as above
        univRooms = splitUnivDataBlocks(univCourse.rooms_for_blocks);
        univTeachers = splitUnivDataBlocks(univCourse.teachers_for_blocks);
        univModules = splitUnivDataBlocks(univCourse.modules_for_blocks);

        // Eliminating the course by testing its characteristics from the most likely to differ to the least likely (saves time)
        if (univCourse.start_at === dbCourse.start && univCourse.end_at === dbCourse.end) {
            if (univCourse.notes === dbCourse.notes || (univCourse.notes === null && dbCourse.notes === '') || (univCourse.notes === undefined && dbCourse.notes === '')) {
                if (areArraysEqual(univRooms, dbRooms)) {
                    if (areArraysEqual(univTeachers, dbTeachers)) {
                        if (areArraysEqual(univModules, dbModules)) {
                            if (univCourse.categories === dbCourse.category) {
                                // This University course is the same as the DB course
                                return { found: true, index: i };
                            }
                        }
                    }
                }
            }
        }
        
    }

    return { found: false };
}

// Processes all the courses in a given group to perform add/remove/update operations in our database
async function processGroupCourses(univData, dbData, groupInfos) {
    // Creating a variable to store the operations that have been performed in our database
    const result = { removed: 0, updated: 0, created: 0 };

    // Parsing all the courses stored in our DB for this group
    const dbToRemove = [];
    let wantedCourse;
    for (const course of dbData) {
        // Trying to find the course in the latest University data
        wantedCourse = await isDbCourseInUnivArray(course, univData);
        if (wantedCourse.found) { // if the course is found remove it from univData
            univData.splice(wantedCourse.index, 1);
        } else { // else flag it for deletion
            dbToRemove.push(course);
        }
    }
    // Now, univData only contains the courses that need to be added to our DB 
    // and dbToRemove contains the courses that need to be deleted

    // Browsing the courses that need to be deleted from our database
    for (const course of dbToRemove) {
        if (course.groups.length > 1) {
            // If there are several groups in the course record, modify it by just deleting the group
            const updatedGroups = [];
            course.groups.forEach((group) => {
                if (group.toString() !== groupInfos._id.toString()) {
                    updatedGroups.push(group)
                }
            });
            await Course.updateOne({ _id: course._id }, {
                $set: { groups: updatedGroups }
            });
            result.updated += 1;
        } else {
            // If there is only one group in the course record, delete it
            await Course.deleteOne({ _id: course._id });
            result.deleted += 1;
        }
    }
    
    // Browsing courses that remain in univData (new to our database)
    for (const course of univData) {
        // Checking if data is valid (e.g: excludes holidays with no associated rooms)
        if (!course.start_at || !course.end_at || !course.id || !course.celcat_id || !course.rooms_for_blocks) continue;

        // Processing the course's rooms, teachers and modules to put them into our DB format
        let rooms = splitUnivDataBlocks(course.rooms_for_blocks);
        rooms = await Promise.all(rooms.map(async (roomName) => (await processRoom(roomName))._id));
        const teachers = splitUnivDataBlocks(course.teachers_for_blocks);
        const modules = splitUnivDataBlocks(course.modules_for_blocks);

        // Checking if the course already exists in our DB
        const existingCourse = await Course.findOne({
            univId: course.id.toString(),
            start: course.start_at,
            end: course.end_at,
            category: course.categories || '',
            notes: course.notes || '',
            rooms: { 
                $all: rooms, // only checks that all the elements of rooms are present
                $size: rooms.length // so we need to also check the array size
                // if it contains exactly all the rooms it's the same array 
            },
            teachers: { // same here
                $all: teachers,
                $size: teachers.length
            },
            modules: { // same here
                $all: modules,
                $size: modules.length
            },
        });

        if (!existingCourse || existingCourse === null || existingCourse === undefined) {
            // If the course doesn't exists, create it in our DB
            const newCourse = new Course({
                univId: course.id,
                celcatId: course.celcat_id,
                category: course.categories || '',
                start: course.start_at,
                end: course.end_at,
                notes: course.notes || '',
                color: closestPaletteColor(course.color) || '#FF7675',
                rooms: rooms,
                teachers: teachers,
                groups: [groupInfos._id],
                modules: modules
            });
            await newCourse.save();
            result.created += 1;
        } else {
            // If the course already exists, add the current processed group to its record
            await Course.updateOne({ _id: existingCourse._id }, {
                $push: { groups: groupInfos._id }
            });
            result.updated += 1;
        }
    }
    
    return result;
}

// Retrieves courses for a group
async function fetchCourses(group) {
    // Saving the start time to make stats
    const startProcessingTime = new Date();

    // Getting dates for the specified amount of time
    const dates = getRequestDates(DAYS_TO_RETRIEVE);

    // Logging if needed
    if (process.env.LOGS_RECUP_GPES == "true") {
        console.log(`---- Récupération des cours pour le groupe ${group.name} du ${dates.start} au ${dates.end}`);
    }

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
        let result = await processGroupCourses(jsonData, dbRecords, groupInfos);

        // Calculating the new average processing time
        const processingTime = new Date() - startProcessingTime;
        averageProcessingTime.timeSum += processingTime;
        averageProcessingTime.measuresNumber++;

        // Logging if needed
        if (process.env.LOGS_RECUP_GPES == "true") {
            console.log(`Supprimés : ${result.removed} | Mis à jour : ${result.updated} | Créés : ${result.created}`);
            console.log(`Temps de traitement : ${parseFloat('' + (processingTime / 1000)).toFixed(2)}s | Temps de traitement moyen : ${parseFloat('' + ((averageProcessingTime.timeSum / averageProcessingTime.measuresNumber) / 1000)).toFixed(2)}s`)
        }

        // Sending an update message to all clients
        wsManager.sendGroupsUpdate(group.name);
    } catch (error) {
        console.error(`Erreur pour le groupe ${group.name} (id : ${group.univId}, url : ${requestUrl}) :`, error);
    }
}

// Processes a batch of groups
async function processBatchGroups() {
    const groups = await Group.find();
    for (const group of groups) {
        await fetchCourses(group);
    }
}

// Process only one group
async function processGroup(groupName) {
    const group = await Group.findOne({ name: groupName });
    // console.log(group)
    await fetchCourses(group);
}

// Main
async function getCourses() {
    const groups = await Group.find();

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
                    // console.log('Démarrage d\'un nouveau cycle de 12h');
                    averageProcessingTime = { timeSum: 0, measuresNumber: 0 };
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

export { getCourses, processBatchGroups, processGroup };