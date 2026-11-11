import { z } from "zod";

import {
    getDateFromTimestampString,
    ignoreSecondsAndLower,
} from "../utils/date.js";
import { integer, nonEmptyString } from "./common.validator.js";

const timestamp = nonEmptyString.transform((value, context) => {
    try {
        return ignoreSecondsAndLower(getDateFromTimestampString(value));
    } catch {
        context.addIssue({
            code: "custom",
            message: "Invalid date",
        });
        return z.NEVER;
    }
});

const nonNegativeInteger = integer.refine((value) => value >= 0, {
    error: "Only positive numbers are allowed",
});

const boolean = nonEmptyString.transform((value, context) => {
    const normalized = value.toLowerCase();
    if (!["true", "false", "1", "0"].includes(normalized)) {
        context.addIssue({
            code: "custom",
            message: "Invalid boolean",
        });
        return z.NEVER;
    }

    return normalized === "true" || normalized === "1";
});

const roomType = nonEmptyString
    .transform((value) => value.toLowerCase())
    .pipe(
        z.enum(["info", "tp", "td", "amphi"], {
            error: "Invalid type",
        }),
    );

const availableValidator = z.object({
    campusId: nonEmptyString,
    start: timestamp,
    end: timestamp,
    seats: nonNegativeInteger.optional(),
    whiteBoards: nonNegativeInteger.optional(),
    blackBoards: nonNegativeInteger.optional(),
    includeBadge: boolean.optional(),
    visio: boolean.optional(),
    ilot: boolean.optional(),
    type: roomType.optional(),
});

// TODO: need review
const timetableValidator = z.object({
    weekNumber: integer.refine((value) => value >= 0 && value <= 42, {
        error: "Invalid week number",
    }),
});

const roomIdValidator = z.object({
    roomId: nonEmptyString,
});

const allValidator = z.object({
    campusId: nonEmptyString,
});

export {
    availableValidator,
    timetableValidator,
    allValidator,
    roomIdValidator,
};
