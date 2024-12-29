import Stats from "../models/stats.js";

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
    try {
        let today = new Date().toISOString().split('T')[0];
        let userStats = await Stats.findOne({ user_id: userId, date: today });
        if (!userStats) {
            const userStatsToday = new Stats({
                date: today,
                room_requests: statName === 'room_requests' ? 1 : 0,
                rooms_list_requests: statName === 'rooms_list_requests' ? 1 : 0,
                available_rooms_requests: statName === 'available_rooms_requests' ? 1 : 0,
                internal_errors: statName === 'internal_errors' ? 1 : 0,
                user_id: userId,
                user_agent: userAgent
            });
            await userStatsToday.save();
        } else {
            let update;
            if (statName === 'rooms_list_requests') {
                update = { $inc: { rooms_list_requests: 1 } };
            } else if (statName === 'available_rooms_requests') {
                update = { $inc: { available_rooms_requests: 1 } };
            } else if (statName === 'room_requests') {
                update = { $inc: { room_requests: 1 } };
            } else if (statName === 'internal_errors') {
                update = { $inc: { internal_errors: 1 } };
            }
            update.user_agent = userAgent;
            await Stats.findOneAndUpdate({ user_id: userId, date: today }, update, {});
        }
    } catch (error) {
        console.error(`Erreur pendant l'enregistrement de statistiques (${error})`);
    }
}

export { updateStats, compareStatsObjs };