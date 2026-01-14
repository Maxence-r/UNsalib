import { Campus, CampusSchemaProperties } from "models/campus.model.js";

class CampusesService {
    /**
     * Get all campuses
     */
    async getAllCampuses(): Promise<CampusSchemaProperties[]> {
        return await Campus.find().lean();
    }

    /**
     * Get campus by name
     */
    async getCampusByName(name: string): Promise<string | null> {
        return (await Campus.findOne({ name }).lean())?._id.toString() || null;
    }

    /**
     * Create campuses if they don't exist
     */
    async createIfNotExist(campuses: string[]) {
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
