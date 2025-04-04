import Stat from "../models/stat.js";
import io from '../../../server.js';

// Compares two statistics to sort them
function compareStatsObjs(a, b) {
    if (a.date < b.date) {
        return -1;
    } else if (a.date > b.date) {
        return 1;
    } else {
        return 0;
    }
}

// Adds records to the database for statistical purposes
async function updateStats(statName, userId, userAgent) {
    if (userId && userAgent) {
        try {
            let today = new Date().toISOString().split('T')[0];
            let userStats = await Stat.findOne({ userId: userId, date: today });
            if (!userStats) {
                const userStatsToday = new Stat({
                    date: today,
                    roomRequests: statName === 'room_requests' ? 1 : 0,
                    roomsListRequests: statName === 'rooms_list_requests' ? 1 : 0,
                    availableRoomsRequests: statName === 'available_rooms_requests' ? 1 : 0,
                    internalErrors: statName === 'internal_errors' ? 1 : 0,
                    userId: userId,
                    userAgent: userAgent
                });
                await userStatsToday.save();
            } else {
                let update;
                if (statName === 'rooms_list_requests') {
                    update = { $inc: { roomsListRequests: 1 } };
                } else if (statName === 'available_rooms_requests') {
                    update = { $inc: { availableRoomsRequests: 1 } };
                } else if (statName === 'room_requests') {
                    update = { $inc: { roomRequests: 1 } };
                } else if (statName === 'internal_errors') {
                    update = { $inc: { internalErrors: 1 } };
                }
                update.userAgent = userAgent;
                await Stat.findOneAndUpdate({ userId: userId, date: today }, update, {});
            }
            io.emit('statsUpdated', { message: '' });
        } catch (error) {
            console.error(`Erreur pendant l'enregistrement de statistiques (${error})`);
        }
    }
}

export { updateStats, compareStatsObjs };