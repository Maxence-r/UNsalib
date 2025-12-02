import { Group } from "../models/group.js";

class GroupsService {
    /**
     * Find groups from a courses array
     */
    async getFromCourses(
        courses: { groups: string[] }[],
    ): Promise<{ [key: string]: string }> {
        const coursesGroups: string[] = [];
        courses.forEach((course) => {
            course.groups.forEach((group) => {
                if (!coursesGroups.includes(group)) {
                    coursesGroups.push(group);
                }
            });
        });

        const dbGroups = await Group.find({
            _id: { $in: coursesGroups },
        });

        const parsedGroups: { [key: string]: string } = {};
        dbGroups.forEach((group) => {
            parsedGroups[group._id.toString()] = group.name;
        });

        return parsedGroups;
    }
}

const groupsService = new GroupsService();

export { groupsService };
