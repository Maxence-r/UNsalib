import { Types } from "mongoose";
import { Building } from "../models/building.model.js";
import { Room } from "models/room.model.js";

class BuildingsService {
    /**
     * Move building to another campus
     */
    async moveBuilding(buildingId: Types.ObjectId, newCampusId: Types.ObjectId) {
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
    async mergeBuildings(sourceBuildingId: Types.ObjectId, targetBuildingId: Types.ObjectId) {
        const sourceBuilding = await Building.findById(sourceBuildingId);
        const targetBuilding = await Building.findById(targetBuildingId);
        if (!sourceBuilding || !targetBuilding) {
            throw new Error("Building not found");
        }
        // Move all rooms from source building to target building
        const rooms = await Room.find({ building: sourceBuildingId });
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