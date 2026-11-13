import { ApiGet, ApiPatch } from "./axios";
import type { ApiDataBuilding } from "../utils/types/api.type";
import type { Campuses } from "../stores/settings.store";

class GetBuildingsList extends ApiGet<ApiDataBuilding[]> {
    constructor(campusId: Campuses) {
        super(`/buildings?campusId=${campusId}`);
    }
}

class UpdateBuilding extends ApiPatch<void> {
    constructor(id: string, alias: string | null) {
        super(`/buildings/${id}`, { alias });
    }
}

export { GetBuildingsList, UpdateBuilding };
