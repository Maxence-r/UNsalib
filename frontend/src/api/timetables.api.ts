import { api } from "./axios";
import type { ApiDataTimetable } from "../utils/types/api.type";

async function getRoomTimetable(increment: number, roomId?: string) {
    if (!roomId) return;
    const res = await api.get(
        `/rooms/timetable?id=${roomId}&increment=${increment}`,
    );
    return res.data as ApiDataTimetable;
}

export { getRoomTimetable };
