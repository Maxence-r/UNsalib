import type { ApiRoom } from "./api-types.js";

interface GetRoomsListResult {
    success: boolean,
    data: ApiRoom[],
    message: string
}

export async function getRoomsList(uuid: string, userAgent: string): Promise<GetRoomsListResult> {
    try {
        const response = await fetch(`http://localhost:9000/rooms`, {
            headers: {
                "content-type": "application/json",
                "user-agent": userAgent || "",
                "cookie": `clientUuid=${uuid};`
            },
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const rooms = await response.json();
        return {
            success: true,
            data: rooms.data,
            message: ""
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            message: error as string
        };
    }
}