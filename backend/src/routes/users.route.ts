import express from "express";

import { usersController } from "../controllers/users.controller.js";
import { statHandler } from "../middlewares/stats.middleware.js";

const router = express.Router();

router.post("/not-a-bot", statHandler, usersController.notABot);

router.post("/from-qrcode", statHandler, usersController.setFromQrCode);

export { router };
