import { Request, Response, NextFunction } from "express";
// import { matchedData } from "express-validator";

class BuildingsController {
    /**
     * @route  GET /buildings/by-campus
     * @desc   Return buildings by campus id
     * @access Private
     **/
    async getBuildingsByCampusId(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const campusId = matchedData(req).campusId;
            const buildings = await Building.find({ campus: campusId });
            if (!buildings) {
                throw new Error("Buildings not found");
            }
            res.json({ success: true, data: buildings });
        } catch (error) {
            next(error);
        }
    }
}

const buildingsController = new BuildingsController();

export { buildingsController };
