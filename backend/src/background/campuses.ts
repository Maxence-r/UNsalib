import { campusesService } from "../services/campuses.service.js";
import { dataConfig } from "../configs/data.config.js";

async function initCampuses(): Promise<void> {
    await campusesService.createIfNotExist(
        dataConfig.campus.map((campus) => campus.name),
    );
}

export { initCampuses };
