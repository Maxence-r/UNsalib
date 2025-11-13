import { JwtPayload } from "jsonwebtoken";
import pkg from "jsonwebtoken";
import "dotenv/config";
import Account from "../models/account.js";
const { verify } = pkg;

async function getAccountFromToken(token: string): Promise<null | string> {
    let userId: null | string = null;
    try {
        if (!process.env.TOKEN)
            throw Error("No environment variable 'TOKEN' found");
        const decodedToken: string | JwtPayload = verify(
            token,
            process.env.TOKEN,
        );
        if (
            typeof decodedToken !== "string" &&
            decodedToken.userId &&
            (await Account.exists({ _id: decodedToken.userId }))
        ) {
            userId = decodedToken.userId as string;
        }
        return userId;
    } catch {
        return userId;
    }
}

export { getAccountFromToken };
