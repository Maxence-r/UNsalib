import { query } from "express-validator";
import mongoose from "mongoose";

import { isValidDate, getWeekInfos, getWeeksNumber } from "utils/date.js";

const availableValidation = [
    query("start")
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .custom((value: string) => isValidDate(value))
        .withMessage("Invalid date format"),
    query("end")
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .custom((value: string) => isValidDate(value))
        .withMessage("Invalid date format"),
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
    query("nobadge")
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
        .custom((value: string) => {
            return ["info", "tp", "td", "amphi"].includes(value);
        })
        .withMessage("Invalid type"),
    query("features")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .toLowerCase()
        .custom((value: string) => {
            const featuresArray = value.split("-");
            for (const feature of featuresArray) {
                if (!["visio", "ilot"].includes(feature.trim().toLowerCase())) {
                    return false;
                }
            }
            return true;
        })
        .withMessage("Invalid features found")
        .customSanitizer((value: string) => value.split("-")),
];

const timetableValidation = [
    query("id")
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .custom((id: string) => mongoose.Types.ObjectId.isValid(id))
        .withMessage("Invalid format"),
    query("increment")
        .optional()
        .notEmpty()
        .withMessage("Missing value")
        .trim()
        .isNumeric()
        .withMessage("Value must be a number")
        .toInt()
        .customSanitizer((increment: number) => {
            const weekInfos = getWeekInfos(getWeeksNumber() + increment);
            if (
                weekInfos.number < 0 ||
                weekInfos.number > 52 ||
                increment > 18
            ) {
                throw new Error("Invalid increment");
            }
            return weekInfos;
        }),
];

export { availableValidation, timetableValidation };
