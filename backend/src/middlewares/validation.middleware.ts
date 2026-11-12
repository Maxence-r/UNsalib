import type { z } from "zod";
import { middleware, type Middleware } from "../utils/express/middleware.js";

interface ValidatedFields<S extends z.ZodType> {
    validated: z.output<S>;
}

function validateBody<S extends z.ZodType>(
    schema: S,
): Middleware<ValidatedFields<S>> {
    return middleware((req) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            throw result.error;
        }

        return { validated: result.data };
    });
}

function validateParams<S extends z.ZodType>(
    schema: S,
): Middleware<ValidatedFields<S>> {
    return middleware((req) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            throw result.error;
        }

        return { validated: result.data };
    });
}

function validateQuery<S extends z.ZodType>(
    schema: S,
): Middleware<ValidatedFields<S>> {
    return middleware((req) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            throw result.error;
        }

        return { validated: result.data };
    });
}

export { validateBody, validateParams, validateQuery, type ValidatedFields };
