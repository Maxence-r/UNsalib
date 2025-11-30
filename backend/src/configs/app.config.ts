import { logger } from "utils/logger.js";

if (!process.env.TOKEN) {
    logger.error(
        "No 'TOKEN' environment variable found. Please set a token to use UNsalib.",
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
    security: {
        token: process.env.TOKEN,
    },
    tasks: {
        syncTimetables: process.env.SYNC_TIMETABLES === "true" || true,
        forceGroupsFetch: process.env.FORCE_GROUPS_FETCH === "true" || false,
        forceTimetablesFetch: process.env.FORCE_TIMETABLES_FETCH === "true" || false,
    },
};

export { config };
