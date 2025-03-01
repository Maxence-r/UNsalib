import { ApiRoomType } from "./types";
import App from './app';
import { PUBLIC_API_URL } from "./store";

export default async function PreFetchData() {
    const response = await fetch(`${PUBLIC_API_URL}/rooms`);
    const rooms: ApiRoomType[] = await response.json();
    // TODO: handle error when fetching
    // const rooms = [];

    return <App prefetchedRoomsList={rooms}></App>;
}