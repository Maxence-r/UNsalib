// Based on the work of PregOfficial
// https://github.com/PregOfficial/express-typed-routes

import type { NextFunction, Request, RequestHandler, Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Middleware<Fields = {}> = (
    // Omit the original fields first before processing, e.g. validated needs to be removed so TypeScript can infer
    // the correct type. Otherwise the existing express any type would be considered instead of the more narrow type.
    req: Omit<Request, keyof Fields> & Fields,
    res: Response,
    next: NextFunction,
) => void | Promise<void>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function middleware<NewFields extends object>(
    fn: (req: Request, res: Response) => Promise<NewFields> | NewFields,
): Middleware<NewFields> {
    return async (req, res, next) => {
        const result = await fn(req as unknown as Request, res);
        const currentFields = req as unknown as Record<string, unknown>;
        const newFields = result as Record<string, unknown>;

        for (const [field, value] of Object.entries(newFields)) {
            const currentValue = currentFields[field];

            currentFields[field] =
                isRecord(currentValue) && isRecord(value)
                    ? { ...currentValue, ...value }
                    : value;
        }

        next();
    };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
class RouteBuilder<CurrentFields = {}> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private middlewares: Middleware<any>[] = [];

    use<Args extends unknown[], NewFields>(
        middlewareBuilder: (...args: Args) => Middleware<CurrentFields & NewFields>,
        ...args: Args
    ): RouteBuilder<CurrentFields & NewFields> {
        this.middlewares.push(middlewareBuilder(...args));
        return this as RouteBuilder<CurrentFields & NewFields>;
    }

    handle(
        handler: (
            req: Request & CurrentFields,
            res: Response,
        ) => void | Promise<void>,
    ): RequestHandler[] {
        return [...this.middlewares, handler] as RequestHandler[];
    }
}

const route = (): RouteBuilder => new RouteBuilder();

export { route, middleware, type Middleware };
