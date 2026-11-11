import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
// import rateLimit from "express-rate-limit";

import { appConfig } from "./configs/app.config.js";
import { accessLogger } from "./utils/logger.js";
import { router as routes } from "./routes/index.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Initialize Express app
const app = express();

// Security
app.use(helmet());
app.disable("x-powered-by");

// CORS configuration
const corsOptions = {
    origin: appConfig.cors.origin,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "80mb" }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// HTTP request logger
const shortMorganFormat = morgan.compile<Request, Response>(
    ":remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms",
);
app.use(
    morgan((tokens, req, res) => {
        const message = shortMorganFormat(tokens, req, res);
        if (message) {
            if (res.statusCode >= 400 && res.statusCode <= 599) {
                accessLogger.error(message.trim());
            } else {
                accessLogger.info(message.trim());
            }
        }
        return undefined;
    }),
);

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
