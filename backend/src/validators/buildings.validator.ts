import { z } from "zod";

import { nonEmptyString } from "./common.validator.js";

const getByCampusIdValidator = z.object({
    campusId: nonEmptyString,
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

export { getByCampusIdValidator, buildingIdValidator, updateValidator, moveValidator, mergeValidator };
