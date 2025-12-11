import jwt, { JwtPayload } from "jsonwebtoken";

import { Account } from "../models/account.model.js";
import { config } from "../configs/app.config.js";

class AccountsService {
    async getFromToken(token: string): Promise<null | string> {
        try {
            const decodedToken: string | JwtPayload = jwt.verify(
                token,
                config.security.token,
            );
            
            if (typeof decodedToken !== "string" && decodedToken.userId) {
                const user = await Account.findById(decodedToken.userId);

                if (user) {
                    return user._id.toString();
                }
            }

            return null;
        } catch {
            return null;
        }
    }
}

const accountsService = new AccountsService();

export { accountsService };
