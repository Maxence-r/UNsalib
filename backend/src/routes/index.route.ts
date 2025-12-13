import express from "express";
const router = express.Router();

import { router as roomsRoute } from "./rooms.route.js";
import { router as authRoute } from "./auth.route.js";

// Mount routes
router.use("/rooms", roomsRoute);
router.use("/auth", authRoute);

// Health check endpoint
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export { router };
