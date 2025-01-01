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

// Processes a course to add it to the database if it not already exists
async function processCourse(courseData, currentGroupName) {
    // Checking if data is valid
    if (!courseData.start_at || !courseData.end_at || !courseData.id || !courseData.celcat_id || !courseData.rooms_for_blocks) {
        // console.warn(
        //     'Le cours suivant a été ignoré :\n-', 
        //     courseData.modules_for_blocks, '\n-',
        //     courseData.educational_groups_for_blocks, '\n-',
        //     courseData.start_at, '\n-',
        //     courseData.end_at
        // );
        return;
    }

    // Getting rooms and then the main room    
    let rooms = courseData.rooms_for_blocks.split(';');
    rooms = await Promise.all(rooms.map(async (roomName) => {
        roomName = roomName.trim();
        const roomId = await processRoom(roomName);
        return roomId._id;
    }));

    let teachers = [], modules = [];
    if (courseData.teachers_for_blocks && courseData.teachers_for_blocks != '') {
        teachers = courseData.teachers_for_blocks.split(';').map((teacher) => teacher.trim());
    }
    if (courseData.modules_for_blocks && courseData.modules_for_blocks != '') {
        modules = courseData.modules_for_blocks.split(';').map((module) => module.trim());
    }

    // Checking if the course already exists in the database
    const existingCourse = await Course.findOne({
        univId: courseData.id,
        start: courseData.start_at,
        end: courseData.end_at,
        // teachers: { $all: teachers },
        // rooms: { $all: rooms },
        // modules: { $all: modules}
    });

    const currentGroup = await Group.findOne({ name: currentGroupName });

    if (existingCourse === null || existingCourse === undefined) {
        // If the course doesn't exists, create it the database
        const newCourse = new Course({
            univId: courseData.id,
            celcatId: courseData.celcat_id,
            category: courseData.categories || '',
            start: courseData.start_at,
            end: courseData.end_at,
            notes: courseData.notes || '',
            color: closestPaletteColor(courseData.color) || '#FF7675',
            rooms: rooms,
            teachers: teachers,
            groups: [currentGroup._id],
            modules: modules
        });
        await newCourse.save();
    } else {
        await Course.findOneAndUpdate({ _id: existingCourse._id }, {
            category: courseData.categories || '',
            notes: courseData.notes || '',
            color: closestPaletteColor(courseData.color) || '#FF7675',
            teachers: teachers,
            modules: modules,
            $push: { groups: currentGroup._id }
        });
    }
}

async function deleteCoursesForGroup(start, end, groupName) {
    const group = await Group.findOne({ name: groupName });

    let courses = await Course.find({
        start: { $gte: start + 'T00:00:00+01:00' },
        end: { $lte: end + 'T23:59:59+01:00' },
        groups: group._id
    });

    if (!courses) return;

    courses = courses.map((course) => {
        let groups = course.groups;
        groups.pop(groups.indexOf(groupName))
        return {
            id: course._id,
            groups: groups
        }
    });

    await courses.forEach(async (course) => {
        if (!course.groups) {
            await Course.findOneAndUpdate({ _id: course.id }, { $set: { groups: course.groups } });
        } else {
            await Course.deleteOne({ _id: course.id });
        }
    });
}

async function processGroupCourses(univData, dbData, groupName) {
    // const groupName = '230LAS'
    // const univData = [
    //     {
    //         "id": 676506381,
    //         "celcat_id": "2230786",
    //         "categories": "CM stu",
    //         "start_at": "2025-01-20T09:00:00+01:00",
    //         "end_at": "2025-01-20T09:20:00+01:00",
    //         "notes": "16-1,34-0-13,33",
    //         "custom1": null,
    //         "custom2": null,
    //         "custom3": null,
    //         "color": "008000",
    //         "place_id": 55,
    //         "rooms_for_blocks": "Amphi E - Maryam MIRZAKHANI (Bât 1-Admin)",
    //         "rooms_for_item_details": "Amphi E - Maryam MIRZAKHANI (Bât 1-Admin)",
    //         "teachers_for_blocks": "ELLIOT Mary",
    //         "teachers_for_item_details": "ELLIOT Mary",
    //         "educational_groups_for_blocks": "224 ; 235 ; 230LAS ; 222 ; 221 ; 913-223 ; 220",
    //         "educational_groups_for_item_details": "224 ; 235 ; 230LAS ; 222 ; 221 ; 913-223 ; 220",
    //         "modules_for_blocks": "XLG2GE030 - Paleontologie et Paleoenvironnement",
    //         "modules_for_item_details": "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //     },
    //     {
    //         "id": 654146230,
    //         "celcat_id": "2220147",
    //         "categories": "TP stu",
    //         "start_at": "2025-01-20T09:30:00+01:00",
    //         "end_at": "2025-01-20T10:50:00+01:00",
    //         "notes": "21,33-0-0-12",
    //         "custom1": null,
    //         "custom2": null,
    //         "custom3": null,
    //         "color": "33ff33",
    //         "place_id": 26,
    //         "rooms_for_blocks": "sa TP 35Geol-vidéo (Bât 14)",
    //         "rooms_for_item_details": "sa TP 35Geol-vidéo (Bât 14)",
    //         "teachers_for_blocks": "",
    //         "teachers_for_item_details": "",
    //         "educational_groups_for_blocks": "230U",
    //         "educational_groups_for_item_details": "230U",
    //         "modules_for_blocks": "XLG2GE030 - Paleontologie et Paleoenvironnement",
    //         "modules_for_item_details": "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //     },
    //     {
    //         "id": 654146212,
    //         "celcat_id": "2220132",
    //         "categories": "TP stu",
    //         "start_at": "2025-01-20T09:30:00+01:00",
    //         "end_at": "2025-01-20T10:50:00+01:00",
    //         "notes": "21,33-0-0-12",
    //         "custom1": null,
    //         "custom2": null,
    //         "custom3": null,
    //         "color": "33ff33",
    //         "place_id": 26,
    //         "rooms_for_blocks": "sa TP 35Geol-vidéo (Bât 14)",
    //         "rooms_for_item_details": "sa TP 35Geol-vidéo (Bât 14)",
    //         "teachers_for_blocks": "",
    //         "teachers_for_item_details": "",
    //         "educational_groups_for_blocks": "230V",
    //         "educational_groups_for_item_details": "230V",
    //         "modules_for_blocks": "XLG2GE030 - Paleontologie et Paleoenvironnement",
    //         "modules_for_item_details": "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //     },
    //     {
    //         "id": 654146248,
    //         "celcat_id": "2220158",
    //         "categories": "TP stu",
    //         "start_at": "2025-01-20T11:00:00+01:00",
    //         "end_at": "2025-01-20T12:20:00+01:00",
    //         "notes": "21,33-0-0-12",
    //         "custom1": null,
    //         "custom2": null,
    //         "custom3": null,
    //         "color": "33ff33",
    //         "place_id": 26,
    //         "rooms_for_blocks": "sa TP 35Geol-vidéo (Bât 14)",
    //         "rooms_for_item_details": "sa TP 35Geol-vidéo (Bât 14)",
    //         "teachers_for_blocks": "",
    //         "teachers_for_item_details": "",
    //         "educational_groups_for_blocks": "230V",
    //         "educational_groups_for_item_details": "230V",
    //         "modules_for_blocks": "XLG2GE030 - Paleontologie et Paleoenvironnement",
    //         "modules_for_item_details": "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //     }
    // ]

    // const dbData = [
    //     {
    //         "_id": "67753368fb1674bf84c3432b",
    //         "univId": "676506381",
    //         "celcatId": "2230786",
    //         "category": "CM stu",
    //         "start": "2025-01-20T08:00:00+01:00",
    //         "end": "2025-01-20T09:20:00+01:00",
    //         "notes": "16-1,34-0-13,33",
    //         "color": "#16a085",
    //         "rooms": [
    //             "673a61210a689bf852fe27c1"
    //         ],
    //         "teachers": [
    //             "ELLIOT Mary"
    //         ],
    //         "groups": [
    //             "67752d58bcc877e3705ef038",
    //         ],
    //         "modules": [
    //             "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //         ],
    //         "__v": 0
    //     },
    //     {
    //         "_id": "67753369fb1674bf84c34335",
    //         "univId": "654146230",
    //         "celcatId": "2220147",
    //         "category": "TP stu",
    //         "start": "2025-01-20T09:30:00+01:00",
    //         "end": "2025-01-20T10:50:00+01:00",
    //         "notes": "21,33-0-0-12",
    //         "color": "#1abc9c",
    //         "rooms": [
    //             "673a61210a689bf852fe27da"
    //         ],
    //         "teachers": [],
    //         "groups": [
    //             "67752d58bcc877e3705ef038",
    //             "67752d58bcc877e3705ef03b",
    //             "67752d5abcc877e3705ef989",
    //             "67752d5abcc877e3705ef99e",
    //             "67752d5abcc877e3705ef9c2"
    //         ],
    //         "modules": [
    //             "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //         ],
    //         "__v": 0
    //     },
    //     {
    //         "_id": "67753369fb1674bf84c34330",
    //         "univId": "654146212",
    //         "celcatId": "2220132",
    //         "category": "TP stu",
    //         "start": "2025-01-20T09:30:00+01:00",
    //         "end": "2025-01-20T10:50:00+01:00",
    //         "notes": "21,33-0-0-12",
    //         "color": "#1abc9c",
    //         "rooms": [
    //             "673a61210a689bf852fe27da"
    //         ],
    //         "teachers": [],
    //         "groups": [
    //             "67752d58bcc877e3705ef038",
    //             "67752d58bcc877e3705ef03e",
    //             "67752d5abcc877e3705ef989",
    //             "67752d5abcc877e3705ef99e",
    //             "67752d5abcc877e3705ef9c2"
    //         ],
    //         "modules": [
    //             "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //         ],
    //         "__v": 0
    //     },
    //     {
    //         "_id": "67753369fb1674bf84c3433f",
    //         "univId": "654146248",
    //         "celcatId": "2220158",
    //         "category": "TP stu",
    //         "start": "2025-01-20T11:00:00+01:00",
    //         "end": "2025-01-20T12:20:00+01:00",
    //         "notes": "21,33-0-0-12",
    //         "color": "#1abc9c",
    //         "rooms": [
    //             "673a61210a689bf852fe27da"
    //         ],
    //         "teachers": [],
    //         "groups": [
    //             "67752d58bcc877e3705ef038",
    //             "67752d58bcc877e3705ef03e",
    //             "67752d5abcc877e3705ef989",
    //             "67752d5abcc877e3705ef99e",
    //             "67752d5abcc877e3705ef9c2"
    //         ],
    //         "modules": [
    //             "XLG2GE030 - Paleontologie et Paleoenvironnement"
    //         ],
    //         "__v": 0
    //     }
    // ]

    async function parseUnivData(univData) {
        return await Promise.all(univData.map(async (courseData) => {
            let rooms = [], teachers = [], modules = [];
            if (courseData.rooms_for_blocks && courseData.rooms_for_blocks != '') {
                rooms = courseData.rooms_for_blocks.split(';').map((room) => {
                    return room.includes('(') ? room.split('(')[0].trim() : room.trim();
                });
                rooms.sort();
            }
            if (courseData.teachers_for_blocks && courseData.teachers_for_blocks != '') {
                teachers = courseData.teachers_for_blocks.split(';').map((teacher) => teacher.trim());
                teachers.sort();
            }
            if (courseData.modules_for_blocks && courseData.modules_for_blocks != '') {
                modules = courseData.modules_for_blocks.split(';').map((module) => module.trim());
                modules.sort()
            }
            return JSON.stringify({
                id: courseData.id.toString(),
                category: courseData.categories,
                start: courseData.start_at,
                end: courseData.end_at,
                notes: courseData.notes || '',
                rooms: rooms,
                teachers: teachers,
                modules: modules
            });
        }));
    }

    async function parseDbData(dbData) {
        return await Promise.all(dbData.map(async (courseData) => {
            let rooms = await Promise.all(courseData.rooms.map(async (roomId) => {
                const room = await Room.findOne({ _id: roomId });
                return room.name;
            }));
            rooms.sort()
            let modules = courseData.modules;
            modules.sort()
            let teachers = courseData.teachers;
            teachers.sort()
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

    function removeCommonElements(array1, array2) {
        const filteredArray1 = array1.map((item) => array2.includes(item) ? '{}' : item);
        const filteredArray2 = array2.map((item) => array1.includes(item) ? '{}' : item);
        return [filteredArray1, filteredArray2];
    }

    let jsonParsedUnivData = await parseUnivData(univData);
    let jsonParsedDBData = await parseDbData(dbData);
    // console.log(jsonParsedUnivData.length, jsonParsedDBData.length)

    const filteredArrays = removeCommonElements(jsonParsedUnivData, jsonParsedDBData);
    jsonParsedUnivData = filteredArrays[0], jsonParsedDBData = filteredArrays[1];

    // console.log(jsonParsedUnivData[100], jsonParsedDBData[120])
    const toUpdate = [], toDelete = [], toCreate = [];

    const currentGroup = await Group.findOne({ name: groupName });

    jsonParsedDBData.forEach(async (course, index) => {
        if (course != '{}') {
            if (dbData[index].groups.length > 1) {
                let updatedCourse = dbData[index];
                updatedCourse.groups.splice(updatedCourse.groups.indexOf(currentGroup._id.toString()), 1);
                // toUpdate.push(updatedCourse);
                await Course.findOneAndUpdate({ _id: updatedCourse._id }, {
                    $set: { groups: updatedCourse.groups }
                });
            } else {
                // toDelete.push(dbData[index]._id);
                await Course.deleteOne({ _id: dbData[index]._id });
            }
        }
    });

    for (let index = 0; index < jsonParsedUnivData.length; index++) {
        let course = jsonParsedUnivData[index];
        if (course != '{}') {
            // console.log(univData[index])
            const courseData = univData[index];

            if (!courseData.start_at || !courseData.end_at || !courseData.id || !courseData.celcat_id || !courseData.rooms_for_blocks) {
                continue;
            }

            const existingCourse = await Course.findOne({
                univId: courseData.id,
                start: courseData.start_at,
                end: courseData.end_at,
            });

            if (existingCourse === null || existingCourse === undefined) {
                // Getting rooms and then the main room    
                let rooms = courseData.rooms_for_blocks.split(';');
                rooms = await Promise.all(rooms.map(async (roomName) => {
                    roomName = roomName.includes('(') ? roomName.split('(')[0].trim() : roomName.trim();
                    const roomId = await processRoom(roomName);
                    return roomId._id;
                }));

                let teachers = [], modules = [];
                if (courseData.teachers_for_blocks && courseData.teachers_for_blocks != '') {
                    teachers = courseData.teachers_for_blocks.split(';').map((teacher) => teacher.trim());
                }
                if (courseData.modules_for_blocks && courseData.modules_for_blocks != '') {
                    modules = courseData.modules_for_blocks.split(';').map((module) => module.trim());
                }

                // toCreate.push({
                //     univId: courseData.id,
                //     celcatId: courseData.celcat_id,
                //     category: courseData.categories || '',
                //     start: courseData.start_at,
                //     end: courseData.end_at,
                //     notes: courseData.notes || '',
                //     color: closestPaletteColor(courseData.color) || '#FF7675',
                //     rooms: rooms,
                //     teachers: teachers,
                //     groups: [currentGroup._id],
                //     modules: modules
                // });
                const newCourse = new Course({
                    univId: courseData.id,
                    celcatId: courseData.celcat_id,
                    category: courseData.categories || '',
                    start: courseData.start_at,
                    end: courseData.end_at,
                    notes: courseData.notes || '',
                    color: closestPaletteColor(courseData.color) || '#FF7675',
                    rooms: rooms,
                    teachers: teachers,
                    groups: [currentGroup._id],
                    modules: modules
                });
                await newCourse.save();
            } else {
                await Course.findOneAndUpdate({ _id: existingCourse._id }, {
                    $push: { groups: currentGroup._id }
                });
                // toUpdate.push('ok')
            }
        }
    }

    // console.log('\n', toDelete.length, '\n-------------------\n', toUpdate.length, '\n-------------------\n', toCreate.length)

    // toCreate.forEach((item) => {
    //     console.log(item.univId)
    // });
}

// Retrieves courses for a group
async function fetchCourses(group) {
    const startTime = new Date(); 
    // Getting dates for the specified amount of time
    const dates = getRequestDates(DAYS_TO_RETRIEVE);

    process.stdout.write(`Récupération des cours pour le groupe ${group.name} du ${dates.start} au ${dates.end}`);

    // Building request URL
    const requestUrl = `https://edt-v2.univ-nantes.fr/events?start=${dates.start}&end=${dates.end}&timetables%5B%5D=${group.univId}`;

    try {
        // Getting data from the Nantes Université timetable API
        const response = await fetch(requestUrl);
        const jsonData = await response.json();

        const groupInfos = await Group.findOne({ name: group.name });
        const dbRecords = await Course.find({
            start: { $gte: dates.start + 'T00:00:00+01:00' },
            end: { $lte: dates.end + 'T23:59:59+01:00' },
            groups: groupInfos._id
        });

        // Deleting old records
        // await deleteCoursesForGroup(dates.start, dates.end, group.name);

        // Processing each course
        // for (const course of jsonData) {
        //     await processCourse(course, group.name);
        // }
        await processGroupCourses(jsonData, dbRecords, group.name);

        // Sending an update message to all clients
        io.emit('groupUpdated', { message: `Groupe ${group.name} mis à jour` });

        process.stdout.write(`\rRécupération des cours pour le groupe ${group.name} du ${dates.start} au ${dates.end} (${(new Date() - startTime) / 1000}s)\n`);
    } catch (error) {
        console.error(`Erreur pour le groupe ${group.name} (id : ${group.univId}, url : ${requestUrl}) :`, error);
    }
}

// Processes a batch of groups
async function processBatchGroups(groups) {
    for (const group of groups) {
        await fetchCourses(group);
    }
    // for (let i = 255; i < groups.length; i++) {
    //     await fetchCourses(groups[i]);
    // }
}

// Main
async function getCourses() {

    // const test = await Course.aggregate([
    //     {"$group" : { "_id": "$univId", "count": { "$sum": 1 } } },
    //     {"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } }, 
    //     {"$project": {"univId" : "$_id", "_id" : 0} }
    // ]);

    // console.log(test.length)
    // test();
    // return;

    const groups = await Group.find();

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
                    await fetchCourses(group);
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
    console.log('\nDémarrage du cycle de mise à jour...');
    console.log(`${groupsNumber} groupes seront traités toutes les ${CYCLE_INTERVAL / 1000 / 60 / 60}h`);
    console.log(`Intervalle entre chaque groupe : ${intervalBetweenGroups / 1000} secondes`);
    startUpdateCycle();
}

export default getCourses;