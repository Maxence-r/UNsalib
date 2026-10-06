import { Request, Response, NextFunction } from "express";

import { usersService } from "../services/users.service.js";

const UUID_VERSION = 1;

async function statHandler(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    req.userId = "";
    if (req.cookies && req.cookies[`uuid-v${UUID_VERSION}`]) {
        req.userId = req.cookies[`uuid-v${UUID_VERSION}`] as string;
    }

    if (!req.userId || !(await usersService.isValidUser(req.userId))) {
        req.userId = await usersService.addNew(req.get("User-Agent") ?? "");
        res.cookie(`uuid-v${UUID_VERSION}`, req.userId, {
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
            sameSite: "lax",
            httpOnly: true,
        });
    }

    next();
}

export { statHandler };
