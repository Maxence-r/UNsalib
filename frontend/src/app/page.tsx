import Panel from './panel';
import Calendar from './calendar';
import ContextProvider from "./contextProvider";
import { RoomsListType } from "./types";

export default async function Home() {
    const response = await fetch(`${process.env.API_URI}/rooms`);
    const rooms: RoomsListType[] = await response.json();

    return (
        <ContextProvider>
            <section className="no-compatible">
                <p>Votre écran est orienté dans le mauvais sens ou trop petit.</p>
            </section>
            <section className="loader">
                <div className="progress">
                    <img src="/loader.svg" />
                </div>
            </section>
            <Panel roomsList={rooms}></Panel>
            <Calendar></Calendar>
            <div className="notif">
                <p>Attention vous avez dépassé</p>
            </div>
        </ContextProvider>
    );
}