export const dynamic = "force-dynamic"; // fix build error (Route / couldn't be rendered statically because it used `cookies`n)

import { cookies, headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

import { ApiAppState, ApiRoomsList } from "@/_utils/api-types";
import App from "./app";
import { getRoomsList } from "./_utils/server-actions";

async function fetchAppState(): Promise<ApiAppState> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/app-state`, {
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Impossible de récupérer le mode de l'application.");
        console.error(error);
        return { maintenance: false, vacation: false };
    }
}

async function fetchRooms(): Promise<ApiRoomsList> {
    const cookieStore = await cookies();
    const clientHeaders = await headers();
    const clientId = cookieStore.get("clientUuid")?.value;
    const clientUserAgent = clientHeaders.get("user-agent");

    const rooms = await getRoomsList(clientId ? clientId : "", clientUserAgent ? clientUserAgent : "");

    if (rooms.success) {
        return rooms.data;
    } else {
        console.error("Impossible de récupérer la liste des salles !");
        return [];
    }
}

export default async function PreFetchData() {
    const appState = await fetchAppState();

    if (appState.maintenance) {
        redirect("/maintenance", RedirectType.replace);
    }
    if (appState.vacation) {
        redirect("/vacances", RedirectType.replace);
    }

    return <App prefetchedRoomsList={await fetchRooms()}></App>;
}
