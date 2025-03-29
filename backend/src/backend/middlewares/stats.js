import crypto from 'crypto';
import {
    updateStats
} from '../utils/stats.js';

const stats = async (req, res, next) => {
    req.statsUUID = req.cookies.clientId;

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