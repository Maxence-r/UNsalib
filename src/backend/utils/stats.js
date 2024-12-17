import Stats from "../models/stats.js";

async function updateStats(statName) {
    // TODO : get user-agents and userIds
    // console.log("******")
    // console.log(req.userId)
    // console.log(req.get('User-Agent'))
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
    await Stats.findOneAndUpdate({ date: new Date().toISOString().split('T')[0] }, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    });
}

export { updateStats };