import { z } from "zod";
import { middleware, type Middleware } from "../utils/express/middleware.js";
import { ApiError } from "../utils/errors.js";

interface ValidatedFields<S extends z.ZodType> {
    validated: z.output<S>;
}

function formatZodErrors(
    errors: z.ZodError,
    validationType: "body" | "params" | "query",
): {
    [key: string]: unknown;
} {
    const fieldErrors = z.flattenError(errors).fieldErrors;

    const formattedErrors: { [key: string]: unknown } = {};
    for (const [key, value] of Object.entries(fieldErrors)) {
        try {
            let message = Array.isArray(value)
                ? value.join(" ; ")
                : String(value);

            if (message.includes("received undefined")) {
                message = "Missing value";
            }

            formattedErrors[`${validationType}:${key}`] = message;
        } catch {
            formattedErrors[`${validationType}:${key}`] = value;
        }
    }

    return formattedErrors;
}

function validateBody<S extends z.ZodType>(
    schema: S,
): Middleware<ValidatedFields<S>> {
    return middleware((req) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(
                400,
                "Validation failed",
                formatZodErrors(result.error, "body"),
            );
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
            throw new ApiError(
                400,
                "Validation failed",
                formatZodErrors(result.error, "params"),
            );
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
            throw new ApiError(
                400,
                "Validation failed",
                formatZodErrors(result.error, "query"),
            );
        }

        return { validated: result.data };
    });
}

export { validateBody, validateParams, validateQuery, type ValidatedFields };
