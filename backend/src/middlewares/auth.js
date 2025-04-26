import { getAccountFromToken } from '../utils/auth.js';

const authentication = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token || token === 'undefined') {
        return next();
    }

    try {
        req.connected = false;
        const userId = await getAccountFromToken(token);
        if (userId) {
            req.userId = userId;
            req.connected = true;
        }
        return next();
    } catch (error) {
        res.clearCookie('token');
        return next();
    }
};

export default authentication;