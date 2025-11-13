if (!process.env.TOKEN) {
    console.error("No 'TOKEN' environment variable found. Please set a token to use UNsalib.")
    process.exit(1);
}

export const CONFIG = {
    PUBLIC_FRONTEND_URL:
        process.env.PUBLIC_FRONTEND_URL || "http://localhost:3000",
    PRIVATE_FRONTEND_URL:
        process.env.PRIVATE_FRONTEND_URL || "http://localhost:3000",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/unsalib",
    PORT: process.env.PORT ?? "9000",
    LOGS_RECUP_GPES: process.env.LOGS_RECUP_GPES === "true",
    FORCER_RECUP_GPES: process.env.FORCER_RECUP_GPES === "true",
    FORCER_TRAITEMENT_GPES: process.env.FORCER_TRAITEMENT_GPES === "true",
    CORRIGER_GPES_INCORRECTS: process.env.CORRIGER_GPES_INCORRECTS === "true",
    SYNC_TIMETABLES: process.env.SYNC_TIMETABLES === "true",
    TOKEN: process.env.TOKEN,
    PUBLIC_DOMAIN: process.env.PUBLIC_DOMAIN || "localhost"
};
