export const dynamic = "force-dynamic"; // fix build error (Route / couldn't be rendered statically because it used `cookies`n)

import { ApiRoomType } from "./_utils/types";
import App from "./app";
import { cookies, headers } from "next/headers";

async function getRoomsList() {
    let rooms: ApiRoomType[] = [];
    try {
        const cookieStore = await cookies();
        const clientHeaders = await headers();
        const clientId = cookieStore.get("clientUuid")?.value;
        const clientUserAgent = clientHeaders.get("user-agent");
        const response = await fetch(`${process.env.PRIVATE_API_URL}/rooms`, {
            headers: {
                "content-type": "application/json",
                "user-agent": clientUserAgent || "",
                "cookie": `clientUuid=${clientId};`
            },
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        rooms = await response.json();
        return rooms;
    } catch (error) {
        console.error("Impossible de récupérer la liste des salles !");
        console.error(error);
    }
    return rooms;
}

export default async function PreFetchData() {
    return <App prefetchedRoomsList={await getRoomsList()}></App>;
}