import { Response } from "express";

const ROUTE_ERROR = {
    INTERNAL: "INTERNAL_ERROR",
    MISSING_PARAMETERS: "MISSING_PARAMETERS",
};

function handleRouteError(
    errorType: keyof typeof ROUTE_ERROR,
    message: string,
    res: Response,
    path: string,
): void {
    if (errorType === "INTERNAL") {
        console.error(
            `[INTERNAL ERROR] Error while processing the request at '${path}'\n${message}`,
        );
        res.status(500).json({ error: ROUTE_ERROR[errorType] });
        return;
    }
    res.status(401).json({ error: ROUTE_ERROR[errorType] });
}

export { ROUTE_ERROR, handleRouteError };
