import { create } from "zustand";

import type { ApiDataRoom } from "../utils/types/api.type";

interface Room {
    id: string;
    name: string;
    buildingName: string;
    features: ("visio" | "badge" | "video" | "ilot")[];
    available: boolean | null;
    displayed: boolean;
}

interface RoomsStore {
    rooms: Room[];
    filtered: boolean;
    setRooms: (rooms: ApiDataRoom[]) => void;
    setAvailableRooms: (availableRoomIds: string[]) => void;
    setDisplayedRooms: (displayedRoomIds: string[]) => void;
    resetDisplayedRooms: () => void;
}

const useRoomsStore = create<RoomsStore>()((set) => ({
    rooms: [],
    filtered: false,

    setRooms: (rooms): void =>
        set({
            rooms: rooms.map((r) => ({
                ...r,
                available: false,
                displayed: true,
            })),
            filtered: false,
        }),
    setAvailableRooms: (availableRoomIds): void =>
        set((s) => ({
            rooms: s.rooms.map((room) => ({
                ...room,
                available: availableRoomIds.includes(room.id),
            })),
        })),
    setDisplayedRooms: (displayedRoomIds): void =>
        set((s) => {
            const rooms = s.rooms.map((room) => ({
                ...room,
                displayed: displayedRoomIds.includes(room.id),
            }));

            return {
                rooms,
                filtered: rooms.some((room) => !room.displayed),
            };
        }),
    resetDisplayedRooms: (): void =>
        set((s) => ({
            rooms: s.rooms.map((room) => ({
                ...room,
                displayed: true,
            })),
            filtered: false,
        })),
}));

export { useRoomsStore, type Room };
