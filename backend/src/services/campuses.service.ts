import { Types } from "mongoose";

import { Campus, CampusSchemaProperties } from "models/campus.model.js";

class CampusesService {
    /**
     * Get all campuses
     */
    async getAllCampuses(): Promise<
        (CampusSchemaProperties & { _id: Types.ObjectId })[]
    > {
        return await Campus.find().lean();
    }

    /**
     * Get campus ID by name
     */
    async getCampusIdByName(name: string): Promise<Types.ObjectId | undefined> {
        return (await Campus.findOne({ name }).lean())?._id;
    }

    /**
     * Create campuses if they don't exist
     */
    async createIfNotExist(campuses: string[]): Promise<void> {
        for (const campus of campuses) {
            await Campus.findOneAndUpdate(
                { name: campus },
                { name: campus },
                { upsert: true, new: true },
            );
        }
    }
}

const campusesService = new CampusesService();

export { campusesService };
