import pkg from 'jsonwebtoken';
const { verify } = pkg;
import 'dotenv/config'
import Account from '../models/account.js';

async function getAccountFromToken(token) {
    let userId = undefined;
    try {
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