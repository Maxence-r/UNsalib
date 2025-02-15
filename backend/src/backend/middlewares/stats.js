import crypto from 'crypto';
import {
    updateStats
} from '../utils/stats.js';

const stats = async (req, res, next) => {
    const UUID = req.cookies.uuid;

    if (!UUID) {
        try {
            const newUUID = crypto.randomBytes(16).toString('hex');
            res.cookie('uuid', newUUID, { maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'Lax' });
            req.statsUUID = newUUID;
        } catch {
            return next();
        }
    } else {
        req.statsUUID = UUID;
    }

    // Updating stats
    if (req.path == '/api/rooms' || req.path == '/api/rooms/') {
        updateStats('rooms_list_requests', req.statsUUID, req.get('User-Agent'));
    } else if (req.path == '/api/rooms/timetable' || req.path == '/api/rooms/timetable/') {
        updateStats('room_requests', req.statsUUID, req.get('User-Agent'));
    } else if (req.path == '/api/rooms/available' || req.path == '/api/rooms/available/') {
        updateStats('available_rooms_requests', req.statsUUID, req.get('User-Agent'));
    }
    
    return next();
};

export default stats;