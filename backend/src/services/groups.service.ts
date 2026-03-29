import { Types } from "mongoose";
import { Group, GroupSchemaProperties } from "../models/group.model.js";

import { dataConfig } from "configs/data.config.js";
import type { SectorSchemaProperties } from "models/sector.model.js";
import { logger } from "utils/logger.js";
import {
    extractGroupsFromCelcatHtml,
    extractGroupsFromUnivHtml,
    type UnivGroup,
    type CelcatGroup,
} from "utils/extractors.js";

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
     * Update a group
     */
    async update(
        id: string,
        univId?: number,
        celcatId?: number,
    ): Promise<void> {
        const group = await Group.findOne({
            _id: id,
        });
        if (!group) {
            throw new Error("Group not found");
        }

        if (univId) group.univId = univId;
        if (celcatId) group.celcatId = celcatId;

        await group.save();
    }

    /**
     * Add a new group
     */
    async add(
        sectorId: string,
        name: string,
        univId?: number,
        celcatId?: number,
    ): Promise<void> {
        await new Group({
            _id: name,
            univId,
            celcatId,
            sectorId,
        }).save();
    }

    /**
     * Delete a group
     */
    async delete(groupId: string): Promise<void> {
        await Group.deleteOne({ _id: groupId });
    }

    async getBySectorId(sectorId: string): Promise<GroupSchemaProperties[]> {
        return await Group.find({ sectorId }).lean();
    }

    /**
     * Get all groups for a campus
     */
    async getGroupsForCampus(
        campusId: string,
    ): Promise<(GroupSchemaProperties & { _id: Types.ObjectId })[]> {
        return await Group.find({ campusId }).lean();
    }

    mergeExtracted(
        celcatGroups: CelcatGroup[],
        univGroups: UnivGroup[],
    ): ((UnivGroup & CelcatGroup) | UnivGroup | CelcatGroup)[] {
        if (celcatGroups.length === 0) return univGroups;
        if (univGroups.length === 0) return celcatGroups;

        const mergedGroups: (
            | (UnivGroup & CelcatGroup)
            | UnivGroup
            | CelcatGroup
        )[] = [];

        const largestGroupsArray =
            celcatGroups.length > univGroups.length ? celcatGroups : univGroups;
        const additionalGroupsArray =
            celcatGroups.length > univGroups.length ? univGroups : celcatGroups;

        for (const g of largestGroupsArray) {
            const additionalGroupIndex = additionalGroupsArray.findIndex(
                (ag) => ag.name === g.name,
            );

            let additionalGroupInfos: UnivGroup[] | CelcatGroup[] | null = null;
            if (additionalGroupIndex !== -1) {
                additionalGroupInfos = additionalGroupsArray.splice(
                    additionalGroupIndex,
                    additionalGroupIndex + 1,
                );
            }

            mergedGroups.push({
                name: g.name,
                ...("celcatId" in g
                    ? { celcatId: g.celcatId }
                    : { univId: g.univId }),
                ...(additionalGroupInfos &&
                    additionalGroupInfos.length > 0 &&
                    ("celcatId" in additionalGroupInfos[0]
                        ? { celcatId: additionalGroupInfos[0].celcatId }
                        : { univId: additionalGroupInfos[0].univId })),
            });
        }

        additionalGroupsArray.forEach((g) =>
            mergedGroups.push({
                name: g.name,
                ...("celcatId" in g
                    ? { celcatId: g.celcatId }
                    : { univId: g.univId }),
            }),
        );

        return mergedGroups;
    }

    async processMergedGroups(
        sectorId: string,
        existingGroups: GroupSchemaProperties[],
        mergedGroups: ((UnivGroup & CelcatGroup) | UnivGroup | CelcatGroup)[],
    ): Promise<{
        added: number;
        updated: number;
        existingGroups: GroupSchemaProperties[];
    }> {
        let added = 0;
        let updated = 0;

        for (const group of mergedGroups) {
            const existingGroup = existingGroups.find(
                (g) => g._id === group.name,
            );

            if (existingGroup) {
                // Group exists, check if it needs to be updated
                if (
                    ("univId" in group &&
                        existingGroup.univId !== group.univId) ||
                    ("celcatId" in group &&
                        existingGroup.celcatId !== group.celcatId)
                ) {
                    await this.update(
                        group.name,
                        "univId" in group ? group.univId : undefined,
                        "celcatId" in group ? group.celcatId : undefined,
                    );
                    updated++;
                }

                // Remove the processed group from the available groups array
                existingGroups = existingGroups.filter(
                    (g) => g._id !== group.name,
                );
            } else {
                // New group, add it to the database with the default campus
                // provided in the function arguments
                await groupsService.add(
                    sectorId,
                    group.name,
                    "univId" in group ? group.univId : undefined,
                    "celcatId" in group ? group.celcatId : undefined,
                );
                added++;
            }
        }

        return { added, updated, existingGroups };
    }

    async sync(sectors: SectorSchemaProperties[]): Promise<void> {
        logger.info("Starting groups sync");

        let addedGroups = 0;
        let updatedGroups = 0;
        const start = Date.now();
        const remainingGroups: GroupSchemaProperties[] = [];
        let processedSectors = 0;

        for (const sector of sectors) {
            try {
                const dbGroups = await this.getBySectorId(sector._id);

                const univPageResponse = await fetch(
                    `${dataConfig.baseUrl}/${sector.univId}/educational_groups`,
                );
                const celcatPageResponse = await fetch(
                    `${dataConfig.baseUrlCelcat}/${sector.celcatId}/gindex.html`,
                );

                const extractedUniv = extractGroupsFromUnivHtml(
                    await univPageResponse.text(),
                );
                const extractedCelcat = sector.celcatId
                    ? extractGroupsFromCelcatHtml(
                          await celcatPageResponse.text(),
                      )
                    : [];

                if (
                    extractedUniv.length === 0 ||
                    extractedCelcat.length === 0
                ) {
                    if (extractedUniv.length === extractedCelcat.length) {
                        // Both are empty, cannot continue
                        throw new Error(
                            "Cannot retrieve data from Celcat and univ",
                        );
                    } else {
                        // Only one is empty
                        if (sector.celcatId) {
                            logger.warn(
                                `Cannot retrieve ${extractedUniv.length > extractedCelcat.length ? "Celcat" : "univ"} groups of the ${sector.campusId} campus, sector '${sector._id}'`,
                            );
                        }
                    }
                }

                const result = await this.processMergedGroups(
                    sector._id,
                    dbGroups,
                    this.mergeExtracted(extractedCelcat, extractedUniv),
                );

                addedGroups += result.added;
                updatedGroups += result.updated;
                // Save the remaining groups to be deleted later
                result.existingGroups.forEach((g) => {
                    if (!remainingGroups.some((rg) => (rg._id = g._id))) {
                        remainingGroups.push(g);
                    }
                });
            } catch (e) {
                logger.error(
                    `Cannot process groups of the ${sector.campusId} campus, sector '${sector._id}'`,
                );
                logger.error(e);
            }

            processedSectors++;
            logger.info(
                `Groups sync progress: ${Math.round((100 * processedSectors) / sectors.length)}%`,
            );
        }

        for (const rg of remainingGroups) {
            // Remaining groups are no longer present, delete them
            await groupsService.delete(rg._id);
        }

        logger.info(
            `Groups sync finished: ${addedGroups} added, ${updatedGroups} updated and ${remainingGroups.length} removed (${Date.now() - start} ms)`,
        );
    }

    async getAll(): Promise<GroupSchemaProperties[]> {
        return await Group.find().lean();
    }
}

const groupsService = new GroupsService();

export { groupsService };
