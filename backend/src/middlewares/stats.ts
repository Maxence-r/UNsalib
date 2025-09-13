import { updateStats } from "../utils/stats.js";
import { Request, Response, NextFunction } from "express";

function statsMiddleware(req: Request, res: Response, next: NextFunction): void {
    req.statsUUID = req.cookies.clientUuid;

    // Updating stats
    if (req.path == "/rooms" || req.path == "/rooms/") {
        void updateStats(
            "rooms_list_requests",
            req.statsUUID,
            req.get("User-Agent"),
        );
    } else if (
        req.path == "/rooms/timetable" ||
        req.path == "/rooms/timetable/"
    ) {
        void updateStats("room_requests", req.statsUUID, req.get("User-Agent"));
    } else if (
        req.path == "/rooms/available" ||
        req.path == "/rooms/available/"
    ) {
        void updateStats(
            "available_rooms_requests",
            req.statsUUID,
            req.get("User-Agent"),
        );
    }

    next();
}

export default statsMiddleware;
