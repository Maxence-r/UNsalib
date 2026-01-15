import { Types } from "mongoose";
import { Group, GroupSchemaProperties } from "../models/group.model.js";

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

    /**
     * Update the name of a group
     */
    async updateName(groupId: string, campusId: string, newName: string) {
        const group = await Group.findOne({univId: groupId, campus: campusId });
        if (!group) {
            throw new Error("Group not found");
        }
        group.name = newName;
        await group.save();
    }

    /**
     * Add a new group
     */
    async addGroup(groupId: string, campusId: string, groupName: string) {
        const existingGroup = await Group.findOne({univId: groupId, campus: campusId });
        if (existingGroup) {
            throw new Error("Group with the same univId and campus already exists");
        }
        const newGroup = new Group({
            univId: groupId,
            campus: campusId,
            name: groupName,
        });
        await newGroup.save();
    }

    /**
     * Delete a group
     */
    async deleteGroup(groupId: string, campusId: string) {
        const group = await Group.findOne({univId: groupId, campus: campusId });
        if (!group) {
            throw new Error("Group not found");
        }
        await Group.deleteOne({ _id: group._id });
    }

    /**
     * Get all groups for a campus
     */
    async getGroupsForCampus(campusId: Types.ObjectId) {
        return await Group.find({ campus: campusId });
    }
}

const groupsService = new GroupsService();

export { groupsService };
