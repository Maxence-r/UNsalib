import { Types } from "mongoose";

import { Building } from "../models/building.model.js";
import { roomsService } from "./rooms.service.js";

class BuildingsService {
    /**
     * Move building to another campus
     */
    async moveBuilding(
        buildingId: Types.ObjectId,
        newCampusId: Types.ObjectId,
    ): Promise<void> {
        const building = await Building.findById(buildingId);
        if (!building) {
            throw new Error("Building not found");
        }

        building.campus = newCampusId;
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
        const rooms = await roomsService.getRoomDocsByBuilding(sourceBuildingId);
        for (const room of rooms) {
            room.building = targetBuildingId;
            await room.save();
        }

        // Delete the source building
        await sourceBuilding.deleteOne();
    }
}

const buildingsService = new BuildingsService();

export { buildingsService };
