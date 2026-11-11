import { z } from "zod";

const integer = z
    .string()
    .trim()
    .min(1, { error: "Missing value" })
    .pipe(z.string().regex(/^[0-9]+$/, { error: "Invalid number" }))
    .transform(Number)
    .pipe(z.number().int({ error: "Invalid integer" }));

const email = z
    .string()
    .trim()
    .min(1, { error: "Missing value" })
    .pipe(z.email({ error: "Invalid email" }));

const nonEmptyString = z.string().trim().min(1, { error: "Missing value" });

export { integer, email, nonEmptyString };