// import express, { json, urlencoded } from "express";
// import cors from "cors";
// import { set, connect } from "mongoose";
// import "dotenv/config";
// import cookieParser from "cookie-parser";

// import launch from "./background/main.js";
// import roomsRoutes from "./routes/rooms.js";
// import adminRoutes from "./routes/admin.js";
// import authRoutes from "./routes/auth.js";
// import authMiddleware from "./middlewares/auth.js";
// import statsMiddleware from "./middlewares/stats.js";
// import { CONFIG } from "./configs/app.config.js";

// const app = express();

// // Server security
// app.disable("x-powered-by");
// // Default
// app.use(
//     cors({
//         origin: [CONFIG.PUBLIC_FRONTEND_URL, CONFIG.PRIVATE_FRONTEND_URL],
//         credentials: true,
//     }),
// );
// app.use(cookieParser());
// app.use(json());
// app.use(urlencoded({ extended: true }));

// // API middlewares
// app.use(authMiddleware);
// app.use(statsMiddleware);
// // API routes
// app.use("/rooms", roomsRoutes);
// app.use("/admin", adminRoutes);
// app.use("/auth", authRoutes);
// // 404 fallback
// app.use((req, res) => {
//     res.status(404);
//     res.json({ error: "NOT_FOUND" });
// });

// // Database connection
// set("strictQuery", true);
// void (async (): Promise<void> => {
//     try {
//         await connect(CONFIG.MONGODB_URI, {});
//         console.log("Connexion à MongoDB réussie !");
//     } catch (err) {
//         console.log("Connexion à MongoDB échouée !");
//         console.log(err);
//         process.exit(0);
//     } finally {
//         // console.log("Jean-Michel", await hash("lesupermotdepasse", 10))
//         // EXECUTION PERMANENTE
//         void launch();
//     }
// })();

// export default app;

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { config } from "./configs/app.config.js";
import { logger } from "./utils/logger.js";
import { router as routes } from "routes/index.route.js";
import { errorHandler } from "middlewares/error.middleware.js";

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
    origin: config.cors.origin,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "80mb" }));

// Compression middleware
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(
        morgan("combined", {
            stream: { write: (message) => logger.info(message.trim()) },
        }),
    );
}

// Rate limiting
// app.use(
//     "/",
//     rateLimit({
//         windowMs: config.rateLimit.windowMs,
//         max: config.rateLimit.max,
//         message: "Too many requests from this IP, please try again later.",
//         standardHeaders: true,
//         legacyHeaders: false,
//     }),
// );

// API routes
app.use("/", routes);

// 404 handler - must come before error handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
