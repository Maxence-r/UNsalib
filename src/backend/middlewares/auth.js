import pkg from 'jsonwebtoken';
const { verify } = pkg;
import 'dotenv/config'

const authentication = async (req, res, next) => {
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

export default authentication;