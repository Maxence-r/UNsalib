import { query } from "express-validator";

import {
    getDateFromTimestampString,
    ignoreSecondsAndLower,
} from "../utils/date.js";

const availableValidation = [
    query("campusId").notEmpty().withMessage("Missing value").trim(),
    query("start")
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .customSanitizer((val: string) =>
            ignoreSecondsAndLower(getDateFromTimestampString(val)),
        ),
    query("end")
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .customSanitizer((val: string) =>
            ignoreSecondsAndLower(getDateFromTimestampString(val)),
        ),
    query("seats")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .isNumeric()
        .withMessage("Invalid number")
        .toInt()
        .custom((value: number) => value >= 0)
        .withMessage("Only positive numbers are allowed"),
    query("whiteboards")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .isNumeric()
        .withMessage("Invalid number")
        .toInt()
        .custom((value: number) => value >= 0)
        .withMessage("Only positive numbers are allowed"),
    query("blackboards")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .isNumeric()
        .withMessage("Invalid number")
        .toInt()
        .custom((value: number) => value >= 0)
        .withMessage("Only positive numbers are allowed"),
    query("includebadge")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .toLowerCase()
        .isBoolean()
        .withMessage("Invalid boolean")
        .toBoolean(),
    query("visio")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .toLowerCase()
        .isBoolean()
        .withMessage("Invalid boolean")
        .toBoolean(),
    query("ilot")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .toLowerCase()
        .isBoolean()
        .withMessage("Invalid boolean")
        .toBoolean(),
    query("type")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .toLowerCase()
        .custom((value: string) =>
            ["info", "tp", "td", "amphi"].includes(value),
        )
        .withMessage("Invalid type"),
];

// TODO: need review
const timetableValidation = [
    query("roomId").notEmpty().withMessage("Missing value").trim(),
    query("weekNumber")
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .isNumeric()
        .withMessage("Invalid number")
        .toInt()
        .custom((value: number) => value >= 0 && value <= 42)
        .withMessage("Invalid week number"),
];

const allValidation = [
    query("campusId").notEmpty().withMessage("Missing value").trim(),
];

export { availableValidation, timetableValidation, allValidation };
