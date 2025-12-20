import { api } from "./axios";
import type { ApiDataTimetable } from "../utils/types/api.type";

async function getRoomTimetable(roomId: string, increment: number) {
    if (!roomId) return;
    const res = await api.get(
        `/rooms/timetable?id=${roomId}&increment=${increment}`,
    );
    return res.data as ApiDataTimetable;
}

export { getRoomTimetable };
