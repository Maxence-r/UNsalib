import { ApiGet } from "./axios";
import type { ApiDataRoom } from "../utils/types/api.type";
import type { Campuses } from "../stores/settings.store";

class GetRoomsList extends ApiGet<ApiDataRoom[]> {
    constructor(campusId: Campuses) {
        super(`/rooms?campusId=${campusId}`);
    }
}

class GetAvailableRooms extends ApiGet<string[]> {
    constructor(
        campusId: Campuses,
        start: Date,
        end: Date,
        seats?: number,
        whiteboards?: number,
        blackboards?: number,
        includeBadge?: boolean,
        visio?: boolean,
        ilot?: boolean,
        type?: "info" | "tp" | "td" | "amphi",
    ) {
        const baseUrl = "/rooms/available?";
        const params = {
            campusid: campusId,
            start: start.getTime(),
            end: end.getTime(),
            ...(seats && { seats }),
            ...(whiteboards && { whiteboards }),
            ...(blackboards && { blackboards }),
            ...(includeBadge && { includebadge: includeBadge }),
            ...(visio && { visio }),
            ...(ilot && { ilot }),
            ...(type && { type }),
        };

        super(
            baseUrl +
                Object.entries(params)
                    .map(([key, value]) => `${key}=${value}`)
                    .join("&"),
        );
    }
}

export { GetRoomsList, GetAvailableRooms };
