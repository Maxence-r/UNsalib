import { Sector, SectorSchemaProperties } from "../models/sector.model.js";

class SectorsService {
    /**
     * Get all sectors
     */
    async getAll(): Promise<SectorSchemaProperties[]> {
        return await Sector.find().lean();
    }

    /**
     * Create sectors if they don't exist, or update them thanks to their unique ID
     */
    async init(
        campuses: {
            name: string;
            sectors: { uuid: string; univId: string; celcatId?: string }[];
        }[],
    ): Promise<void> {
        for (const campus of campuses) {
            for (const sector of campus.sectors) {
                await Sector.findOneAndUpdate(
                    { _id: sector.uuid },
                    {
                        univId: sector.univId,
                        celcatId: sector.celcatId,
                        campusName: campus.name,
                    },
                    { upsert: true, new: true },
                );
            }
        }
    }
}

const sectorsService = new SectorsService();

export { sectorsService };
