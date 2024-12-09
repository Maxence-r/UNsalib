import pkg from 'jsonwebtoken';
const { verify } = pkg;
import Account from "../models/account.js";
import 'dotenv/config'

const authentification = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token || token === 'undefined') {
        return next();
    }

    try {
        const decodedToken = verify(token, process.env.TOKEN.toString());
        req.userId = decodedToken.userId;
        req.connected = true;
        return next();
    } catch (error) {
        res.clearCookie('token');
        return next();
    }
};

export default authentification;