import { Course } from "models/course.js";
import { Room } from "models/room.js";

const CIE_CLOSING_DATE = { dayNumber: 1, startTime: "00:00", endTime: "12:15" };

class RoomsService {
    /**
     * Find all rooms
     */
    async findAll() {
        const availableRooms = await this.findAvailable(
            new Date().toISOString(),
            new Date().toISOString(),
            0,
            0,
            0,
            false,
            null,
            [],
        );

        // Creating an array with the ids of all available rooms
        const availableRoomsIds = availableRooms.map((room) =>
            room._id.toString(),
        );

        // Getting all the rooms that are not banned and adding an 'available' 
        // key with the availability status of each room
        const rooms = (await Room.find({ banned: { $ne: true } }).lean()).map(
            (room) => {
                if (availableRoomsIds.includes(room._id.toString())) {
                    return { ...room, available: true };
                }
                return { ...room, available: false };
            },
        );

        return rooms;
    }

    /**
     * Find available rooms
     */
    async findAvailable(
        start: string,
        end: string,
        seats: number,
        whiteBoards: number,
        blackBoards: number,
        noBadge: boolean,
        type: "info" | "tp" | "td" | "amphi" | null,
        features: ("visio" | "ilot")[],
    ) {
        // Recherche de tous les cours qui débordent sur la période demandée selon 4 cas :
        //
        // CAS 1 : Le cours englobe complètement la période
        // Cours       |--------------------|
        // Demande         |-----------|
        //
        // CAS 2 : Le cours est englobé par la période
        // Cours           |-----------|
        // Demande     |--------------------|
        //
        // CAS 3 : Le cours chevauche le début de la période
        // Cours       |-----------|
        // Demande         |-----------|
        //
        // CAS 4 : Le cours chevauche la fin de la période
        // Cours           |-----------|
        // Demande     |-----------|
        //
        const courses = await Course.find({
            $and: [
                { start: { $lt: end } }, // le cours commence avant la fin de la période demandée
                { end: { $gt: start } }, // le cours finit après le début de la période demandée
            ],
        });

        // Getting all busy rooms ids from the courses array
        const busyRoomsIds: string[] = [];
        courses.forEach((course) => {
            course.rooms.forEach((room) => {
                if (!busyRoomsIds.includes(room)) busyRoomsIds.push(room);
            });
        });

        // Getting available rooms according to the attributes requested by the user
        const availableRooms = await Room.find({
            _id: { $nin: busyRoomsIds }, // free rooms are those not being used for classes
            banned: { $ne: true },
            seats: { $gte: seats },
            "boards.white": { $gte: whiteBoards },
            "boards.black": { $gte: blackBoards },
            ...(type && { type: type.toUpperCase() }),
            ...(noBadge && { features: { $ne: "badge" } }),
            ...features.map((feature) => {
                return { features: feature };
            }),
        });

        // // Filtering info rooms when the CIE is closed
        // const availableRoomsFiltered = [];
        // availableRooms.map((room) => {
        //     if (
        //         room.building.includes("C I E") &&
        //         new Date(start).getDay() == CIE_CLOSING_DATE.dayNumber
        //     ) {
        //         const startTime = new Date(start).getTime() / 1000;
        //         const endTime = new Date(end).getTime() / 1000;
        //         let startClosingTime = new Date(start);
        //         startClosingTime.setHours(
        //             CIE_CLOSING_DATE.startTime.split(":")[0],
        //         );
        //         startClosingTime.setMinutes(
        //             CIE_CLOSING_DATE.startTime.split(":")[1],
        //         );
        //         startClosingTime = startClosingTime.getTime() / 1000;
        //         let endClosingTime = new Date(end);
        //         endClosingTime.setHours(CIE_CLOSING_DATE.endTime.split(":")[0]);
        //         endClosingTime.setMinutes(
        //             CIE_CLOSING_DATE.endTime.split(":")[1],
        //         );
        //         endClosingTime = endClosingTime.getTime() / 1000;
        //         if (
        //             !(startClosingTime < endTime && endClosingTime > startTime)
        //         ) {
        //             availableRoomsFiltered.push(room);
        //         }
        //         return;
        //     }
        //     availableRoomsFiltered.push(room);
        // });

        return availableRooms;
    }
}

const roomsService = new RoomsService();

export { roomsService };
