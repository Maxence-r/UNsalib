import pkg from 'jsonwebtoken';
const { verify } = pkg;
import 'dotenv/config'
import Account from '../models/account.js';

async function getAccountFromToken(token) {
    const decodedToken = verify(token, process.env.TOKEN.toString());
    let userId = undefined;
    if (await Account.exists({ _id: decodedToken.userId })) {
        userId = decodedToken.userId;
    }
    return userId;
}

export { getAccountFromToken };