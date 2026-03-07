import { Types } from "mongoose";
import { Group, GroupSchemaProperties } from "../models/group.model.js";

import { appConfig } from "configs/app.config.js";
import { dataConfig } from "configs/data.config.js";
import { getPageRoot } from "utils/misc.js";
import { campusesService } from "./campuses.service.js";

interface UnivGroup {
    univId: number;
    name: string;
}

interface CelcatGroup {
    celcatId: number;
    name: string;
}

interface GroupsExtractionReport {
    campusName: string;
    added: number;
    updated: number;
    removed: number;
}

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
     * Update the name of a group associated with a certain University ID
     */
    async updateNameByUnivId(
        groupUnivId: number,
        campusId: Types.ObjectId,
        newName: string,
    ): Promise<void> {
        const group = await Group.findOne({
            univId: groupUnivId,
            campusId: campusId,
        });
        if (!group) {
            throw new Error("Group not found");
        }

        group.name = newName;
        await group.save();
    }

    /**
     * Add a new group
     */
    async addGroup(
        groupUnivId: number,
        campusId: Types.ObjectId,
        groupName: string,
    ): Promise<void> {
        const existingGroup = await Group.findOne({
            univId: groupUnivId,
            campusId: campusId,
        });
        if (existingGroup) {
            throw new Error(
                "Group with the same univId and campus already exists",
            );
        }

        const newGroup = new Group({
            univId: groupUnivId,
            campusId: campusId,
            name: groupName,
        });
        await newGroup.save();
    }

    /**
     * Delete a group
     */
    async deleteGroup(groupId: Types.ObjectId): Promise<void> {
        const group = await Group.findOne({
            _id: groupId,
        });
        if (!group) {
            throw new Error("Group not found");
        }

        await Group.deleteOne({ _id: group._id });
    }

    /**
     * Get all groups for a campus
     */
    async getGroupsForCampus(
        campusId: string,
    ): Promise<(GroupSchemaProperties & { _id: Types.ObjectId })[]> {
        return await Group.find({ campusId }).lean();
    }

    async extractFromCelcat(sector: string): Promise<CelcatGroup[]> {
        const docRoot = await getPageRoot(
            `${dataConfig.baseUrlCelcat}/${sector}/gindex.html`,
        );

        const foundGroups: CelcatGroup[] = [];

        const selectElm = docRoot.querySelector("form>select");
        const optionElms = selectElm?.querySelectorAll("option");

        if (optionElms) {
            for (const elm of optionElms) {
                const stringId = elm.getAttribute("value")?.match(/[0-9]+/);
                const groupId = parseInt(stringId ? stringId[0] : "");
                const groupName = elm.innerText;

                if (!isNaN(groupId) && groupName) {
                    if (groupId) {
                        foundGroups.push({
                            celcatId: groupId,
                            name: groupName,
                        });
                    }
                }
            }
        }

        return foundGroups;
    }

    async extractFromUniv(sector: string): Promise<UnivGroup[]> {
        // Get the timetable HTML page to extract groups checkboxes
        const docRoot = await getPageRoot(
            `${dataConfig.baseUrl}/${sector}/educational_groups`,
        );
        const groupInputs = docRoot.querySelectorAll(
            "#desktopGroupForm #educational_groups input",
        );

        const foundGroups: UnivGroup[] = [];

        for (const input of groupInputs) {
            // Get the ID and name for each group checkbox
            const groupId = parseInt(input.getAttribute("value") || "");
            const labelElement = docRoot.querySelector(
                `label[for="${input.id}"]`,
            );
            const groupName = labelElement?.textContent.trim();

            if (!isNaN(groupId) && groupName) {
                foundGroups.push({
                    univId: groupId,
                    name: groupName,
                });
            }
        }

        return foundGroups;
    }

    async processExtracted(
        campusId: Types.ObjectId,
        existingGroups: (GroupSchemaProperties & { _id: Types.ObjectId })[],
        extractedGroups: UnivGroup[] | CelcatGroup[],
    ): Promise<{
        added: number;
        updated: number;
        existingGroups: (GroupSchemaProperties & { _id: Types.ObjectId })[];
    }> {
        let added = 0;
        let updated = 0;

        if (extractedGroups.length === 0)
            return { added, updated, existingGroups };

        // TODO AFTER

        const isCelcat = "celcatId" in extractedGroups[0];


        for (const group of extractedGroups) {
            const existingGroup = extractedGroups.existingGroups.find(
                (g) => g.univId === group.id,
            );

            if (existingGroup) {
                // Group exists, check if the name needs to be updated
                if (existingGroup.name !== group.name) {
                    await groupsService.updateNameByUnivId(
                        group.id,
                        campusId,
                        group.name,
                    );

                    updated++;
                }

                // Remove the processed group from the available groups array
                existingGroups = existingGroups.filter(
                    (g) => g.univId !== group.id,
                );
            } else {
                // New group, add it to the database
                await groupsService.addGroup(group.id, campusId, group.name);
                added++;
            }
        }

        return { added, updated, existingGroups };
    }

    async launchExtraction(): Promise<GroupsExtractionReport[]> {
        const operationReports: GroupsExtractionReport[] = [];
        const campuses = await campusesService.getAll();

        for (const campus of campuses) {
            let existingGroups = await groupsService.getGroupsForCampus(
                campus._id,
            );

            let totalAdded = 0;
            let totalUpdated = 0;

            for (const sectorId of campus.sectorIds) {
                const extractedGroups = await (appConfig.tasks.extractFromCelcat
                    ? this.extractFromCelcat(sectorId)
                    : this.extractFromUniv(sectorId));

                const result = await this.processExtracted(
                    campus._id,
                    existingGroups,
                    extractedGroups,
                );

                totalAdded += result.added;
                totalUpdated += result.updated;
                existingGroups = result.existingGroups;
            }

            for (const existingGroup of existingGroups) {
                // Remaining existing groups are no longer present, delete them
                await groupsService.deleteGroup(existingGroup._id);
            }

            operationReports.push({
                campusName: campus.name,
                added: totalAdded,
                updated: totalUpdated,
                removed: existingGroups.length,
            });
        }

        return operationReports;
    }
}

const groupsService = new GroupsService();

export { groupsService };
