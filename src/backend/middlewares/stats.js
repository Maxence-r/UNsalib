import crypto from 'crypto';

const stats = async (req, res, next) => {
    const UUID = req.cookies.uuid;

    if (!UUID) {
        try {
            const newUUID = crypto.randomBytes(16).toString('hex');
            res.cookie('uuid', newUUID, { maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'Lax' });
            req.statsUUID = newUUID;
        } finally {
            return next();
        }
    }

    req.statsUUID = UUID;
    return next();
};

export default stats;