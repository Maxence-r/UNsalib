import { Stat } from "../models/stat.model.js";

class StatsService {
    /**
     * Save a new stat
     */
    async addNew(userId: string, path: string, date: Date): Promise<void> {
        await Stat.create({
            date: date,
            userId: userId,
            path: path,
        });
    }
}

const statsService = new StatsService();

export { statsService };
