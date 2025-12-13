import { body } from "express-validator";

const loginValidation = [
    body("username").notEmpty().withMessage("Missing value").trim(),
    body("password").notEmpty().withMessage("Missing value"),
];

export { loginValidation };
