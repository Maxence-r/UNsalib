import { RoomsListType } from "./types";
import App from './app';

export default async function PreFetchData() {
    const response = await fetch(`${process.env.API_URI}/rooms`);
    const rooms: RoomsListType[] = await response.json();
    // TODO: handle error when fetching
    // const rooms = [];

    return <App prefetchedRoomsList={rooms}></App>;
}