const config = {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
};

export { config };
