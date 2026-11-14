import { ApiGet, ApiPatch, ApiPost } from "./axios";
import type { ApiDataBuilding } from "../utils/types/api.type";
import type { Campuses } from "../stores/settings.store";

class GetBuildingsList extends ApiGet<ApiDataBuilding[]> {
    constructor(campusId?: Campuses) {
        super("/buildings" + (campusId ? `?campusId=${campusId}` : ""));
    }
}

class UpdateBuilding extends ApiPatch<void> {
    constructor(id: string, alias: string | null) {
        super(`/buildings/${id}`, { alias });
    }
}

class MoveBuilding extends ApiPatch<void> {
    constructor(id: string, campusId: Campuses) {
        super(`/buildings/${id}/move`, { campusId });
    }
}

class MergeBuilding extends ApiPost<void> {
    constructor(sourceId: string, targetId: string) {
        super(`/buildings/merge`, { sourceId, targetId });
    }
}

export { GetBuildingsList, UpdateBuilding, MoveBuilding, MergeBuilding };
