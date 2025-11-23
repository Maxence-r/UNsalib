export const dynamic = "force-dynamic"; // fix build error (Route / couldn't be rendered statically because it used `cookies`n)

import { cookies, headers } from "next/headers";

import { ApiRoomsList } from "@/_utils/api-types";
import App from "./app";
import { getRoomsList } from "./_utils/server-actions";

async function fetchRooms(): Promise<ApiRoomsList> {
    const cookieStore = await cookies();
    const clientHeaders = await headers();
    const clientId = cookieStore.get("clientUuid")?.value;
    const clientUserAgent = clientHeaders.get("user-agent");

    const rooms = await getRoomsList(
        clientId ? clientId : "",
        clientUserAgent ? clientUserAgent : "",
    );

    if (rooms.success) {
        return rooms.data;
    } else {
        console.error("Impossible de récupérer la liste des salles !");
        return { success: false, data: [] };
    }
}

export default async function PreFetchData() {
    return <App prefetchedRoomsList={await fetchRooms()}></App>;
}
