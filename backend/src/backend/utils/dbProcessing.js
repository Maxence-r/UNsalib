import Group from '../models/group.js';

async function getGroupsFromCoursesList(courses) {
    const coursesGroups = [];
    courses.forEach((course) => {
        course.groups.forEach(group => {
            if (!coursesGroups.includes(group)) {
                coursesGroups.push(group);
            }
        });
    });

    const dbGroups = await Group.find({
        _id: { $in: coursesGroups }
    });

    const parsedGroups = {};
    dbGroups.forEach((group) => {
        parsedGroups[group._id] = group.name;
    });

    return parsedGroups;
}

export { getGroupsFromCoursesList };