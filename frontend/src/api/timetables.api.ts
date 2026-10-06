import { ApiGet } from "./axios";
import type { ApiDataTimetable } from "../utils/types/api.type";

class GetRoomTimetable extends ApiGet<ApiDataTimetable> {
    constructor(roomId: string, weekNumber: number) {
        super(`/rooms/timetable?roomId=${roomId}&weekNumber=${weekNumber}`);
    }
}

export { GetRoomTimetable };
