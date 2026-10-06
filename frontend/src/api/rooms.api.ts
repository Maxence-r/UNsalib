import { ApiGet } from "./axios";
import type { ApiDataRoom } from "../utils/types/api.type";
import type { Campuses } from "../stores/settings.store";

class GetRoomsList extends ApiGet<ApiDataRoom[]> {
    constructor(campusId: Campuses) {
        super(`/rooms?campusId=${campusId}`);
    }
}

export { GetRoomsList };
