import crypto from 'crypto';
import {
    updateStats
} from '../utils/stats.js';

const stats = async (req, res, next) => {
    req.statsUUID = req.cookies.clientUuid;

    // Updating stats - now passing the request object for IP tracking
    if (req.path == '/api/rooms' || req.path == '/api/rooms/') {
        updateStats('rooms_list_requests', req.statsUUID, req.get('User-Agent'), req);
    } else if (req.path == '/api/rooms/timetable' || req.path == '/api/rooms/timetable/') {
        updateStats('room_requests', req.statsUUID, req.get('User-Agent'), req);
    } else if (req.path == '/api/rooms/available' || req.path == '/api/rooms/available/') {
        updateStats('available_rooms_requests', req.statsUUID, req.get('User-Agent'), req);
    }
    
    return next();
};

export default stats;