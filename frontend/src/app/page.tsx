import { ApiRoomType } from "./types";
import App from './app';

export default async function PreFetchData() {
    let rooms: ApiRoomType[] = [];
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`);
        rooms = await response.json();
    } catch {
        console.error("Impossible de récupérer la liste des salles");
    }

    return <App prefetchedRoomsList={rooms}></App>;
}