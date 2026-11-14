import { z } from "zod";

import { nonEmptyString } from "./common.validator.js";

const getAllValidator = z.object({
    campusId: nonEmptyString.optional(),
});

const buildingIdValidator = z.object({
    id: nonEmptyString,
});

const updateValidator = z.object({
    alias: nonEmptyString.nullable(),
});

const moveValidator = z.object({
    campusId: nonEmptyString,
});

const mergeValidator = z.object({
    sourceId: nonEmptyString,
    targetId: nonEmptyString,
});

export { getAllValidator, buildingIdValidator, updateValidator, moveValidator, mergeValidator };
