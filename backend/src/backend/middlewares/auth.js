import pkg from 'jsonwebtoken';
const { verify } = pkg;
import 'dotenv/config'
import Account from '../models/account.js';

const authentication = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token || token === 'undefined') {
        return next();
    }

    try {
        const decodedToken = verify(token, process.env.TOKEN.toString());
        if (await Account.exists({ _id: decodedToken.userId })) {
            req.userId = decodedToken.userId;
            req.connected = true;
        } else {
            req.connected = false;
        }
        return next();
    } catch (error) {
        res.clearCookie('token');
        return next();
    }
};

export default authentication;