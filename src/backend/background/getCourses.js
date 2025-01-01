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
    if (!courseData.teachers_for_blocks) {
        teachers = courseData.teachers_for_blocks.split(';').map((teacher) => teacher.trim());
    }
    if (!courseData.modules_for_blocks) {
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
        await Course.findOneAndUpdate({ _id: existingCourse._id }, { $push: { groups: currentGroup._id }});
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
            await Course.findOneAndUpdate({ _id: course.id }, { $set: { groups: course.groups }});
        } else {
            await Course.deleteOne({ _id: course.id });
        }
    });
}

// Retrieves courses for a group
async function fetchCourses(group) {
    // Getting dates for the specified amount of time
    const dates = getRequestDates(DAYS_TO_RETRIEVE);

    process.stdout.write(`\r\x1b[KRécupération des cours pour le groupe ${group.name} du ${dates.start} au ${dates.end}`);

    // Building request URL
    const requestUrl = `https://edt-v2.univ-nantes.fr/events?start=${dates.start}&end=${dates.end}&timetables%5B%5D=${group.univId}`;

    try {
        // Getting data from the Nantes Université timetable API
        const response = await fetch(requestUrl);
        const jsonData = await response.json();

        // Deleting old records
        await deleteCoursesForGroup(dates.start, dates.end, group.name);

        // Processing each course
        for (const course of jsonData) {
            await processCourse(course, group.name);
        }

        // Sending an update message to all clients
        io.emit('groupUpdated', { message: `Groupe ${group.name} mis à jour` });
    } catch (error) {
        console.error(`Erreur pour le groupe ${group.name} (id : ${group.univId}, url : ${requestUrl}) :`, error);
    }
}

// Processes a batch of groups
async function processBatchGroups(groups) {
    for (const group of groups) {
        await fetchCourses(group);
    }
    // for (let i = 300; i < groups.length; i++) {
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