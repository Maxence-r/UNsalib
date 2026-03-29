import { Campus, CampusSchemaProperties } from "../models/campus.model.js";

class CampusesService {
    /**
     * Get all campuses
     */
    async getAll(): Promise<CampusSchemaProperties[]> {
        return await Campus.find().lean();
    }

    /**
     * Create campuses if they don't exist, or update them
     */
    async init(campuses: string[]): Promise<void> {
        for (const campus of campuses) {
            await Campus.findOneAndUpdate(
                { _id: campus.toLowerCase().replace(" ", "-") },
                { name: campus },
                { upsert: true, new: true },
            );
        }
    }
}

const campusesService = new CampusesService();

export { campusesService };
