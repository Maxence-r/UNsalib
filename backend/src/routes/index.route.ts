import express from "express";

import { sendSuccessResponse } from "../utils/express/controller.js";
import { router as roomsRoute } from "./rooms.route.js";
import { router as authRoute } from "./auth.route.js";
import { router as adminRoute } from "./admin.route.js";
import { router as usersRoute } from "./users.route.js";
import { router as buildingsRoute } from "./buildings.route.js";

const router = express.Router();

// Mount routes
router.use("/rooms", roomsRoute);
router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/users", usersRoute);
router.use("/buildings", buildingsRoute);

// Health check endpoint
router.get("/health", (_req, res) =>
    sendSuccessResponse(res, 200, {
        status: "Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }),
);

export { router };
