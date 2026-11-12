import express from "express";

import { buildingIdValidator, getByCampusIdValidator, mergeValidator, moveValidator, updateValidator } from "../validators/buildings.validator.js";
import { validateQuery } from "../middlewares/validation.middleware.js";
import { buildingsController } from "../controllers/buildings.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { route } from "../utils/express/middleware.js";

const router = express.Router();

router.get(
    "/",
    route()
        .use(authenticate)
        .use(validateQuery, getByCampusIdValidator)
        .handle(buildingsController.getByCampusId),
);

router.patch(
    "/:id",
    route()
        .use(authenticate)
        .use(validateQuery, buildingIdValidator)
        .use(validateQuery, updateValidator)
        .handle(buildingsController.update),
);

router.patch(
    "/:id/move",
    route()
        .use(authenticate)
        .use(validateQuery, buildingIdValidator)
        .use(validateQuery, moveValidator)
        .handle(buildingsController.move),
);

router.post(
    "/merge",
    route()
        .use(authenticate)
        .use(validateQuery, mergeValidator)
        .handle(buildingsController.merge),
);

export { router };
