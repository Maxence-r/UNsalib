import { logger } from "../utils/logger.js";

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    logger.error(
        "JWT secrets are missing from the environment file. Please set 'JWT_SECRET' and 'JWT_REFRESH_SECRET' to use UNsalib securely.",
    );
    process.exit(1);
}

const config = {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
    },
    mongodb: {
        uri: process.env.MONGODB_URI || "mongodb://localhost:27017/unsalib",
    },
    rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS
            ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
            : 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX_REQUESTS
            ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
            : 100,
    },
    server: {
        port: process.env.PORT || 9000,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        accessExpire: process.env.JWT_ACCESS_EXPIRE_SECONDS
            ? parseInt(process.env.JWT_ACCESS_EXPIRE_SECONDS)
            : 60 * 60, // 1 hour
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpire: process.env.JWT_REFRESH_EXPIRE_SECONDS
            ? parseInt(process.env.JWT_REFRESH_EXPIRE_SECONDS)
            : 60 * 60 * 24 * 30, // 30 days,
    },
    tasks: {
        syncTimetables: process.env.SYNC_TIMETABLES === "true" || true,
        forceGroupsFetch: process.env.FORCE_GROUPS_FETCH === "true" || false,
        forceTimetablesFetch:
            process.env.FORCE_TIMETABLES_FETCH === "true" || false,
    },
};

export { config };
