import { campusesService } from "services/campuses.service.js";
import { config } from "configs/data.config.js";

async function initCampuses(): Promise<void> {
    await campusesService.createIfNotExist(
        config.campus.map((campus) => campus.name),
    );
}

export { initCampuses };
