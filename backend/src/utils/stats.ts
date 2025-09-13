import Stat from "../models/stat.js";
import wsManager from "../server.js";

// Compares two statistics to sort them
function compareStatsObjs(
    a: { date: string },
    b: { date: string },
): 1 | -1 | 0 {
    if (a.date < b.date) {
        return -1;
    } else if (a.date > b.date) {
        return 1;
    } else {
        return 0;
    }
}

// Adds records to the database for statistical purposes
async function updateStats(
    statName:
        | "rooms_list_requests"
        | "available_rooms_requests"
        | "room_requests"
        | "internal_errors",
    userId: string | undefined | null,
    userAgent: string | undefined | null,
): Promise<void> {
    if (userId && userAgent) {
        try {
            const today = new Date().toISOString().split("T")[0];
            const userStats = await Stat.findOne({
                userId: userId,
                date: today,
            });
            if (!userStats) {
                const userStatsToday = new Stat({
                    date: today,
                    roomRequests: statName === "room_requests" ? 1 : 0,
                    roomsListRequests:
                        statName === "rooms_list_requests" ? 1 : 0,
                    availableRoomsRequests:
                        statName === "available_rooms_requests" ? 1 : 0,
                    internalErrors: statName === "internal_errors" ? 1 : 0,
                    userId: userId,
                    userAgent: userAgent,
                });
                await userStatsToday.save();
            } else {
                const update: {
                    $inc: { [key: string]: number };
                    userAgent?: string;
                } = { $inc: {} };
                switch (statName) {
                    case "rooms_list_requests":
                        update.$inc.roomsListRequests = 1;
                        break;
                    case "available_rooms_requests":
                        update.$inc.availableRoomsRequests = 1;
                        break;
                    case "room_requests":
                        update.$inc.roomRequests = 1;
                        break;
                    case "internal_errors":
                        update.$inc.internalErrors = 1;
                        break;
                }
                update.userAgent = userAgent;
                await Stat.findOneAndUpdate(
                    { userId: userId, date: today },
                    update,
                    {},
                );
            }
            wsManager.sendStatsUpdate();
        } catch (error) {
            console.error(
                `Erreur pendant l'enregistrement de statistiques (${error as string})`,
            );
        }
    }
}

export { updateStats, compareStatsObjs };
