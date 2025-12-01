import { roomsService } from "services/rooms.service.js";
import { socket } from "server.js";
import { logger } from "../utils/logger.js";

async function buildRoomsStatusArray(): Promise<
    { id: string; available: boolean }[]
> {
    const availableRooms = await roomsService.findAvailable(
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
    const availableRoomsIds = availableRooms.map((room) => room._id.toString());

    // Getting all the rooms and adding the availability status of each room
    const roomsStatuses = (await roomsService.findAll()).map((room) => {
        if (availableRoomsIds.includes(room._id.toString())) {
            return { id: room._id.toString(), available: true };
        }
        return { id: room._id.toString(), available: false };
    });

    return roomsStatuses;
}

function publishAvailableRooms(): void {
    setInterval(() => {
        void buildRoomsStatusArray()
            .then((roomsStatuses: { id: string; available: boolean }[]) =>
                socket.sendRoomsUpdate(roomsStatuses),
            )
            .catch((err) => logger.error("Error when publishing available rooms:", err));
    }, 15000);
}

export { publishAvailableRooms };
