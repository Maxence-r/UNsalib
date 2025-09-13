import "dotenv/config";

import Group from "../models/group.js";
import Course from "../models/course.js";

// Main
async function fixDb() {
    const coursesIds = await Course.find({}, "_id");
    let course, exists, newGroups;
    let fixed = 0;
    for (const courseId of coursesIds) {
        course = await Course.findOne({ _id: courseId }, "groups");
        newGroups = [];
        for (const group of course.groups) {
            exists = await Group.exists({ _id: group });
            if (exists) {
                newGroups.push(group);
            }
        }
        if (newGroups.length != course.groups.length) {
            await Course.findOneAndUpdate(
                { _id: courseId },
                {
                    $set: { groups: newGroups },
                },
            );
            fixed += 1;
        }

        process.stdout.write(
            `${coursesIds.indexOf(courseId) + 1}/${coursesIds.length} enregistrements traités (${fixed} corrigés)\r`,
        );
    }
}

// TODO: fix courses with 0 groups even after reprocessing courses

export default fixDb;
