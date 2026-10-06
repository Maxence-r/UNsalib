import { api } from "./axios";
import type { ApiDataRoom } from "../utils/types/api.type";
import type { Campuses } from "../stores/settings.store";

async function getRoomsList(campusId: Campuses): Promise<ApiDataRoom[]> {
    const res = await api.get(`/rooms?campusId=${campusId}`);
    console.log(res)
    return res.data as ApiDataRoom[];
}

export { getRoomsList };
