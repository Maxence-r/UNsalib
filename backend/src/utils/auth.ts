import pkg from "jsonwebtoken";
const { verify } = pkg;
import "dotenv/config";
import Account from "../models/account.js";

async function getAccountFromToken(token: string): Promise<null | string> {
    let userId: null | string = null;
    try {
        if (!process.env.TOKEN)
            throw Error("No environment variable “TOKEN” found");
        const decodedToken = verify(token, process.env.TOKEN.toString());
        if (await Account.exists({ _id: decodedToken.userId })) {
            userId = decodedToken.userId;
        }
        return userId;
    } catch {
        return userId;
    }
}

export { getAccountFromToken };
