import { Stat } from "../models/stat.model.js";

class StatsService {
    /**
     * Save a new stat
     */
    async addNew(
        userId: string,
        type: "search" | "timetable" | "list",
        campusId: string,
        date: Date,
    ): Promise<void> {
        await Stat.create({
            date,
            userId,
            type,
            campusId
        });
    }
}

const statsService = new StatsService();

export { statsService };
