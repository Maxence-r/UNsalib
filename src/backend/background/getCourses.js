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

function splitBlocks(blocks) {
    if (blocks && blocks !== '') {
        return blocks.split(';').map(item => item.trim());
    }
    return [];
}

async function isDbCourseInUnivArray(dbCourse, univDataArray) {
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

    let dbRooms = await Promise.all(dbCourse.rooms.map(async (roomId) => {
        let room = await Room.findOne({ _id: roomId });
        return room.name == room.building ? `${room.name}` : `${room.name} (${room.building})`;
    }));
    let dbModules = dbCourse.modules;
    let dbTeachers = dbCourse.teachers;

    let univRooms, univTeachers, univModules;
    for (let i = 0; i < univDataArray.length; i++) {
        const univCourse = univDataArray[i];

        univRooms = splitBlocks(univCourse.rooms_for_blocks);
        univTeachers = splitBlocks(univCourse.teachers_for_blocks);
        univModules = splitBlocks(univCourse.modules_for_blocks);
        if (univCourse.start_at === dbCourse.start && univCourse.end_at === dbCourse.end) {
            if (univCourse.notes === dbCourse.notes || (univCourse.notes === null && dbCourse.notes === '') || (univCourse.notes === undefined && dbCourse.notes === '')) {
                if (areArraysEqual(univRooms, dbRooms)) {
                    if (areArraysEqual(univTeachers, dbTeachers)) {
                        if (areArraysEqual(univModules, dbModules)) {
                            if (univCourse.categories === dbCourse.category) {
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

async function processGroupCourses(univData, dbData, groupInfos) {
    const result = { removed: 0, updated: 0, created: 0 };
    const dbToRemove = [];
    let index;
    for (const course of dbData) {
        index = await isDbCourseInUnivArray(course, univData);
        if (index.found) {
            univData.splice(index.index, 1);
        } else {
            dbToRemove.push(course);
        }
    }

    // Browsing the courses remaining in our database (to be deleted from our database)
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
    
    // Browsing courses that remain in the university's data (new to our database)
    for (const course of univData) {
        // Checking if data is valid (e.g: excludes holidays with no associated rooms)
        if (!course.start_at || !course.end_at || !course.id || !course.celcat_id || !course.rooms_for_blocks) continue;

        let rooms = splitBlocks(course.rooms_for_blocks);
        rooms = await Promise.all(rooms.map(async (roomName) => (await processRoom(roomName))._id));
        const teachers = splitBlocks(course.teachers_for_blocks);
        const modules = splitBlocks(course.modules_for_blocks);

        // Checking if the course already exists in the database
        const existingCourse = await Course.findOne({
            univId: course.id.toString(),
            start: course.start_at,
            end: course.end_at,
            category: course.categories || '',
            notes: course.notes || '',
            rooms: { 
                $all: rooms,
                $size: rooms.length
            },
            teachers: { 
                $all: teachers,
                $size: teachers.length
            },
            modules: { 
                $all: modules,
                $size: modules.length
            },
        });

        if (!existingCourse || existingCourse === null || existingCourse === undefined) {
            // If the course doesn't exists, create it in the database
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
            // If the course exists, add this group to its record
            await Course.updateOne({ _id: existingCourse._id }, {
                $push: { groups: groupInfos._id }
            });
            result.updated += 1;
        }
    }
    
    return result;
}

// Processes all the courses in a given group to perform add/remove/update operations in our database
async function processGroupCourses2(univData, dbData, groupInfos) {
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
                let updatedGroups = []
                updatedCourse.groups.forEach((group) => {
                    if (group !== groupInfos._id.toString()) {
                        updatedGroups.push(group)
                    }
                });
                await Course.updateOne({ _id: updatedCourse._id }, {
                    $set: { groups: updatedGroups }
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

            const rooms = await Promise.all(course.rooms.map(async (roomName) => (await processRoom(roomName))._id));

            // Checking if the course already exists in the database
            const existingCourse = await Course.findOne({
                univId: courseData.id.toString(),
                start: courseData.start_at,
                end: courseData.end_at,
                category: courseData.categories || '',
                notes: courseData.notes || '',
                rooms: rooms,
                teachers: course.teachers,
                modules: course.modules
            });

            if (existingCourse === null || existingCourse === undefined) {
                // If the course doesn't exists, create it in the database
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
                await Course.updateOne({ _id: existingCourse._id }, {
                    $push: { groups: groupInfos._id }
                });
            }
        }
    }
}

// Retrieves courses for a group
async function fetchCourses(group) {
    // Saving the start time to make stats
    const startProcessingTime = new Date();

    // Getting dates for the specified amount of time
    const dates = getRequestDates(DAYS_TO_RETRIEVE);

    process.stdout.cursorTo(0, process.stdout.rows - 3);
    process.stdout.clearLine(1);
    process.stdout.write(`Récupération des cours pour le groupe ${group.name} du ${dates.start} au ${dates.end}`);

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

        process.stdout.cursorTo(0, process.stdout.rows - 2);
        process.stdout.clearLine(0);
        process.stdout.write(`Supprimés : ${result.removed} | Mis à jour : ${result.updated} | Créés : ${result.created}`);
        process.stdout.cursorTo(0, process.stdout.rows);
        process.stdout.clearLine(0);        
        process.stdout.write(`Temps de traitement : ${parseFloat('' + (processingTime / 1000)).toFixed(2)}s | Temps de traitement moyen : ${parseFloat('' + ((averageProcessingTime.timeSum / averageProcessingTime.measuresNumber) / 1000)).toFixed(2)}s`);

        // Sending an update message to all clients
        io.emit('groupUpdated', { message: `Groupe ${group.name} mis à jour` });
    } catch (error) {
        console.error(`Erreur pour le groupe ${group.name} (id : ${group.univId}, url : ${requestUrl}) :`, error);
    }
}

// Processes a batch of groups
async function processBatchGroups() {
    console.log('\n\n');
    const groups = await Group.find();
    for (const group of groups) {
        await fetchCourses(group);
    }
}

async function processGroup(groupName) {
    console.log('\n\n');
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
    console.log('\nDémarrage du cycle de mise à jour...');
    console.log(`${groupsNumber} groupes seront traités toutes les ${CYCLE_INTERVAL / 1000 / 60 / 60}h`);
    console.log(`Intervalle entre chaque groupe : ${intervalBetweenGroups / 1000} secondes`);
    console.log('\n\n');
    startUpdateCycle();
}

export { getCourses, processBatchGroups, processGroup };