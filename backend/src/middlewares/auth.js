import { getAccountFromToken } from "../utils/auth.js";

async function authMiddleware(req, res, next) {
    req.userId = undefined;
    req.connected = false;
    if (req.path.startsWith("/admin")) {
        const token = req.cookies?.token;
        console.log(token)
        const userId = await getAccountFromToken(token);
        if (userId) {
            req.userId = userId;
            req.connected = true;
        } else {
            return res.status(401).json({ error: "BAD_CREDENTIALS" });
        }
    }

    return next();
};

export default authMiddleware;