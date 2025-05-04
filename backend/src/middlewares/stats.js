import { updateStats } from '../utils/stats.js';

async function statsMiddleware(req, res, next) {
    req.statsUUID = req.cookies.clientUuid;

    // Updating stats
    if (req.path == '/rooms' || req.path == '/rooms/') {
        updateStats('rooms_list_requests', req.statsUUID, req.get('User-Agent'));
    } else if (req.path == '/rooms/timetable' || req.path == '/rooms/timetable/') {
        updateStats('room_requests', req.statsUUID, req.get('User-Agent'));
    } else if (req.path == '/rooms/available' || req.path == '/rooms/available/') {
        updateStats('available_rooms_requests', req.statsUUID, req.get('User-Agent'));
    }
    
    return next();
};

export default statsMiddleware;