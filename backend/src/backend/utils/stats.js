import Stat from "../models/stat.js";
import wsManager from "../../../server.js";

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
            const baseStats = {
                roomRequests: 0,
                roomsListRequests: 0,
                availableRoomsRequests: 0,
                searchBarUsed: false,
                homepageScrolled: false,
                internalErrors: 0
            };
            const initialStatsByName = {
                room_requests: { roomRequests: 1 },
                rooms_list_requests: { roomsListRequests: 1 },
                available_rooms_requests: { availableRoomsRequests: 1 },
                search_bar_interaction: { searchBarUsed: true },
                homepage_scroll_interaction: { homepageScrolled: true },
                internal_errors: { internalErrors: 1 }
            };
            if (!userStats) {
                const userStatsToday = new Stat({
                    date: today,
                    ...baseStats,
                    ...(initialStatsByName[statName] || {}),
                    userId: userId,
                    userAgent: userAgent
                });
                await userStatsToday.save();
            } else {
                const update = { $set: { userAgent: userAgent } };
                if (statName === 'rooms_list_requests') {
                    update.$inc = { roomsListRequests: 1 };
                } else if (statName === 'available_rooms_requests') {
                    update.$inc = { availableRoomsRequests: 1 };
                } else if (statName === 'room_requests') {
                    update.$inc = { roomRequests: 1 };
                } else if (statName === 'search_bar_interaction') {
                    update.$set.searchBarUsed = true;
                } else if (statName === 'homepage_scroll_interaction') {
                    update.$set.homepageScrolled = true;
                } else if (statName === 'internal_errors') {
                    update.$inc = { internalErrors: 1 };
                }
                await Stat.findOneAndUpdate({ userId: userId, date: today }, update, {});
            }
            wsManager.sendStatsUpdate();
        } catch (error) {
            console.error(`Erreur pendant l'enregistrement de statistiques (${error})`);
        }
    }
}

export { updateStats, compareStatsObjs };
