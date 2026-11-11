import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/errors.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

type ValidatedRequest<T extends z.ZodType, R extends Request = Request> = R & {
    validated: z.output<T>;
};

type ValidationSchemas = {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
};
type ValidatedData<S extends ValidationSchemas> = z.output<S["body"]> &
    z.output<S["query"]> &
    z.output<S["params"]>;

function withValidated<R extends Request | AuthenticatedRequest>(
    handler: (
        req: R & {
            validated: ValidatedData<ValidationSchemas>;
        },
        res: Response,
        next: NextFunction,
    ) => unknown,
    validationSchemas: ValidationSchemas,
): (
    req: Request | AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => unknown {
    return (req, res, next) => {
        const schemas = [
            [validationSchemas.body, req.body],
            [validationSchemas.query, req.query],
            [validationSchemas.params, req.params],
        ] as const;
        const validatedData: Record<string, unknown> = {};

        for (const [schema, input] of schemas) {
            if (schema === undefined) {
                continue;
            }

            const result = schema.safeParse(input);
            if (!result.success) {
                const schemaShape =
                    "shape" in schema &&
                    typeof schema.shape === "object" &&
                    schema.shape !== null
                        ? (schema.shape as Record<string, unknown>)
                        : undefined;
                const missingFields =
                    input === undefined || input === null
                        ? schemaShape
                            ? Object.keys(schemaShape)
                            : []
                        : result.error.issues
                              .filter(
                                  (issue) =>
                                      issue.code === "invalid_type" &&
                                      issue.path.length > 0 &&
                                      issue.path.reduce<unknown>(
                                          (value, key) =>
                                              value !== null &&
                                              typeof value === "object"
                                                  ? (
                                                        value as Record<
                                                            | string
                                                            | number
                                                            | symbol,
                                                            unknown
                                                        >
                                                    )[key]
                                                  : undefined,
                                          input,
                                      ) === undefined,
                              )
                              .map((issue) => issue.path.join("."))
                              .filter((field) => field.length > 0);

                if (missingFields.length > 0) {
                    throw new ApiError(
                        400,
                        `Missing fields: ${missingFields.join(", ")}`,
                    );
                }

                const customErrorLines = z
                    .prettifyError(result.error)
                    .replaceAll("\n  → at", " at")
                    .split("\n")
                    .map((line) => {
                        const newLine = line
                            .replace("✖ ", "")
                            .replace("Invalid input: ", "");
                        return (
                            String(newLine).charAt(0).toUpperCase() +
                            String(newLine).slice(1)
                        );
                    });

                throw new ApiError(
                    400,
                    "Validation error: " + customErrorLines.join(" ; "),
                );
            }

            Object.assign(validatedData, result.data);
        }

        const validatedReq = Object.assign(req as R, {
            validated: validatedData as ValidatedData<ValidationSchemas>,
        });

        Promise.resolve(handler(validatedReq, res, next)).catch(next);
    };
}

export { withValidated, type ValidatedRequest }