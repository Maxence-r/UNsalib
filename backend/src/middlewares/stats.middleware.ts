import { Request, Response, NextFunction } from "express";

import { usersService } from "services/users.service.js";
import { statsService } from "services/stats.service.js";

async function statHandler(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const date = new Date();

    let uuid = "";
    if (req.cookies && req.cookies.uuid) {
        uuid = req.cookies.uuid as string;
    }

    if (!uuid || !(await usersService.isValidUser(uuid))) {
        uuid = await usersService.addNew(date, req.get("User-Agent") ?? "");
        res.cookie("uuid", uuid, {
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
            sameSite: "lax",
            httpOnly: true,
        });
    } else {
        // Update activity asynchronously to not slow down the request processing
        void usersService.updateLastActivity(uuid, date);
    }

    // Add stat asynchronously to not slow down the request processing
    void statsService.addNew(uuid, req.path, date);

    next();
}

export { statHandler };
