import { getAccountFromToken } from "../utils/auth.js";
import { Request, Response, NextFunction } from "express";

async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    req.userId = undefined;
    req.connected = false;

    if (req.path.startsWith("/admin")) {
        const token = req.cookies?.token;
        const userId = await getAccountFromToken(token);
        if (userId) {
            req.userId = userId;
            req.connected = true;
        } else {
            res.status(401).json({ error: "BAD_CREDENTIALS" });
            return;
        }
    }

    next();
}

export default authMiddleware;
