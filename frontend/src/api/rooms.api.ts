import { api } from "./axios";
import type { ApiDataRoom } from "../utils/types/api.type";

async function getRoomsList() {
    const res = await api.get("/rooms");
    return res.data as ApiDataRoom[];
}

export { getRoomsList };
