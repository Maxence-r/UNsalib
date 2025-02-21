"use client";
import Panel from './panel';
import Calendar from './calendar';
import Modal from "@/components/modal";
import { RoomsListType } from "./types";
import { useModalStore } from './store';


export default function App({ prefetchedRoomsList }: { prefetchedRoomsList: RoomsListType[] }) {
    return (
        <>
            <section className="no-compatible">
                <p>Votre écran est orienté dans le mauvais sens ou trop petit.</p>
            </section>
            <section className="loader">
                <div className="progress">
                    <img src="/loader.svg" />
                </div>
            </section>
            <Panel roomsList={prefetchedRoomsList}></Panel>
            <Calendar></Calendar>
            <Modal isOpened={useModalStore((state) => state.isOpened)} closeFunction={useModalStore((state) => state.close)}>{useModalStore((state) => state.content)}</Modal>
            <div className="notif">
                <p>Attention vous avez dépassé</p>
            </div>
        </>
    );
}