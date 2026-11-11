import { z } from "zod";

import { nonEmptyString } from "./common.validator.js";

const loginValidator = z.object({
    username: nonEmptyString,
    password: nonEmptyString,
});

export { loginValidator };
