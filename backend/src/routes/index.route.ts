import express from "express";
const router = express.Router();

// Import route modules
// const authRoutes = require("./auth.routes");

// Mount routes
// router.use("/auth", authRoutes);

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
