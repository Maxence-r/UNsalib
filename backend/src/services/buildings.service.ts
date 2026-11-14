import type { BuildingSchemaProperties } from "../models/building.model.js";
import { Building } from "../models/building.model.js";
import { roomsService } from "./rooms.service.js";
import { ensureNotNullAsync } from "../utils/errors.js";

class BuildingsService {
    /**
     * Move building to another campus
     */
    async moveBuilding(id: string, targetCampusId: string): Promise<void> {
        const building = await ensureNotNullAsync(
            "Building not found",
            (buildingId: string) => Building.findById(buildingId),
            id,
        );
        building.campusId = targetCampusId;
        await building.save();
    }

    /**
     * Update building details
     */
    async updateBuilding(id: string, alias: string | null): Promise<void> {
        const building = await ensureNotNullAsync(
            "Building not found",
            (buildingId: string) => Building.findById(buildingId),
            id,
        );
        building.alias = alias ? alias : undefined;
        await building.save();
    }

    /**
     * Get buildings by campus
     */
    async getAllBuildings(
        campusId?: string,
    ): Promise<BuildingSchemaProperties[]> {
        return await Building.find(campusId ? { campusId } : {}).lean();
    }

    /**
     * Merge two buildings
     */
    async mergeBuildings(sourceId: string, targetId: string): Promise<void> {
        const sourceBuilding = await ensureNotNullAsync(
            "Source building not found",
            (buildingId: string) => Building.findById(buildingId),
            sourceId,
        );
        await ensureNotNullAsync(
            "Target building not found",
            (buildingId: string) => Building.findById(buildingId),
            targetId,
        );

        // Move all rooms from source building to target building
        const rooms = await roomsService.getRoomDocsByBuilding(sourceId);
        for (const room of rooms) {
            room.buildingId = targetId;
            await room.save();
        }

        // Delete the source building
        await sourceBuilding.deleteOne();
    }

    // /**
    //  * Find all buildings
    //  */
    // async findAll(): Promise<BuildingSchemaProperties[]> {
    //     return await Building.find().lean();
    // }

    // /**
    //  * Return a building associated with the given ID
    //  */
    // async getBuildingById(id: string): Promise<BuildingSchemaProperties> {
    //     const building = await Building.findById(id).lean();
    //     if (!building) throw new Error("Building not found");
    //     return building;
    // }

    // async addBuildigIfNotExists(campusId: string, name: string): Promise<void> {
    //     const existingBuilding = await Building.exists({ _id: name });

    //     if (!existingBuilding) {
    //         // Add the building if not found
    //         const newBuilding = new Building({
    //             _id: name,
    //             campusId: campusId,
    //         });
    //         await newBuilding.save();
    //     }
    // }
}

const buildingsService = new BuildingsService();

export { buildingsService };
