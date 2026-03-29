import { api } from "./axios";
import type { ApiDataRoom } from "../utils/types/api.type";

async function getRoomsList(): Promise<ApiDataRoom[]> {
    const res = await api.get("/rooms?campusId=lombarderie");
    return res.data as ApiDataRoom[];
}

export { getRoomsList };
