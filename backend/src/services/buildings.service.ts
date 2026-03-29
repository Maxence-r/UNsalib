import { Types } from "mongoose";

import {
    Building,
    BuildingSchemaProperties,
} from "../models/building.model.js";
import { roomsService } from "./rooms.service.js";

class BuildingsService {
    /**
     * Move building to another campus
     */
    async moveBuilding(buildingId: string, newCampusId: string): Promise<void> {
        const building = await Building.findById(buildingId);
        if (!building) {
            throw new Error("Building not found");
        }

        building.campusId = newCampusId;
        await building.save();
    }

    /**
     * Merge two buildings
     */
    async mergeBuildings(
        sourceBuildingId: Types.ObjectId,
        targetBuildingId: Types.ObjectId,
    ): Promise<void> {
        const sourceBuilding = await Building.findById(sourceBuildingId);
        const targetBuilding = await Building.findById(targetBuildingId);
        if (!sourceBuilding || !targetBuilding) {
            throw new Error("Building not found");
        }

        // Move all rooms from source building to target building
        const rooms =
            await roomsService.getRoomDocsByBuilding(sourceBuildingId);
        for (const room of rooms) {
            room.building = targetBuildingId;
            await room.save();
        }

        // Delete the source building
        await sourceBuilding.deleteOne();
    }

    /**
     * Find all buildings
     */
    async findAll(): Promise<
        (BuildingSchemaProperties & { _id: Types.ObjectId })[]
    > {
        return await Building.find().lean();
    }

    /**
     * Return a building associated with the given ID
     */
    async getBuildingById(
        buildingId: string,
    ): Promise<BuildingSchemaProperties> {
        const building = await Building.findById(buildingId).lean();
        if (!building) throw new Error("Building not found");
        return building;
    }

    /**
     * Get buildings by campus
     */
    async getBuildingsByCampus(
        campusId: string,
    ): Promise<BuildingSchemaProperties[]> {
        return await Building.find({ campusId }).lean();
    }

    async addBuildigIfNotExists(
        campusId: string,
        univName: string,
    ): Promise<void> {
        const existingBuilding = await Building.exists({ _id: univName });
        if (!existingBuilding) {
            // Add the building if not found
            const newBuilding = new Building({
                _id: univName,
                univName: univName,
                campusId: campusId,
            });
            await newBuilding.save();
        }
    }
}

const buildingsService = new BuildingsService();

export { buildingsService };
