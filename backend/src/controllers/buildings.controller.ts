import type { Request, Response } from "express";

import type { ValidatedFields } from "../middlewares/validation.middleware.js";
import type {
    getByCampusIdValidator,
    buildingIdValidator,
    updateValidator,
    moveValidator,
    mergeValidator,
} from "../validators/buildings.validator.js";
import type { AuthenticatedFields } from "../middlewares/auth.middleware.js";
import { buildingsService } from "../services/buildings.service.js";
import { sendSuccessResponse } from "../utils/express/controller.js";

class BuildingsController {
    constructor() {
        this.getByCampusId = this.getByCampusId.bind(this);
        this.update = this.update.bind(this);
        this.move = this.move.bind(this);
        this.merge = this.merge.bind(this);
    }

    /**
     * Return buildings in the given campus
     **/
    async getByCampusId(
        req: Request &
            AuthenticatedFields &
            ValidatedFields<typeof getByCampusIdValidator>,
        res: Response,
    ): Promise<void> {
        const buildings = await buildingsService.getBuildingsByCampus(
            req.validated.campusId,
        );

        sendSuccessResponse(
            res,
            200,
            buildings.map((building) => ({
                id: building._id,
                alias: building.alias,
            })),
        );
    }

    /**
     * Update building with the given id
     **/
    async update(
        req: Request &
            AuthenticatedFields &
            ValidatedFields<
                typeof buildingIdValidator & typeof updateValidator
            >,
        res: Response,
    ): Promise<void> {
        buildingsService.updateBuilding(req.validated.id, req.validated.alias);

        sendSuccessResponse(res, 200);
    }

    /**
     * Move building to another campus
     **/
    async move(
        req: Request &
            AuthenticatedFields &
            ValidatedFields<typeof buildingIdValidator & typeof moveValidator>,
        res: Response,
    ): Promise<void> {
        await buildingsService.moveBuilding(
            req.validated.id,
            req.validated.campusId,
        );

        sendSuccessResponse(res, 200);
    }

    /**
     * Merge two buildings
     **/
    async merge(
        req: Request &
            AuthenticatedFields &
            ValidatedFields<typeof mergeValidator>,
        res: Response,
    ): Promise<void> {
        await buildingsService.mergeBuildings(
            req.validated.sourceId,
            req.validated.targetId,
        );

        sendSuccessResponse(res, 200);
    }
}

const buildingsController = new BuildingsController();

export { buildingsController };
