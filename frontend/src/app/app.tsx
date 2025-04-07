"use client";
import Panel from "./_components/panel/panel";
import Calendar from "./_components/calendar/calendar";
import Modal from "@/_components/modal";
import Toast from "@/_components/toast";
import { ApiRoomType } from "./_utils/types";
import { useModalStore, useToastStore, useVersionStore } from "./_utils/store";
import Image from "next/image";
import { useEffect } from "react";

export default function App({ prefetchedRoomsList }: { prefetchedRoomsList: ApiRoomType[] }) {
    const isStorageHydrated = useVersionStore((state) => state.hasHydrated);
    const v2Prompt = useVersionStore((state) => state.v2Prompt);
    const setV2Prompt = useVersionStore((state) => state.setV2Prompt);

    useEffect(() => {
        if (isStorageHydrated && !v2Prompt) {
            setV2Prompt();
            window.location.href = "/new";
        }
    }, [isStorageHydrated])

    return (
        <main tabIndex={-1} className="main">
            <section className="no-compatible">
                <p>Votre écran est orienté dans le mauvais sens ou trop petit.</p>
            </section>
            <Panel roomsList={prefetchedRoomsList}></Panel>
            <Calendar></Calendar>
            <Modal isOpened={useModalStore((state) => state.isOpened)} closeFunction={useModalStore((state) => state.close)}>{useModalStore((state) => state.content)}</Modal>
            <Toast show={useToastStore((state) => state.isOpened)} error={useToastStore((state) => state.isError)}>{useToastStore((state) => state.content)}</Toast>
        </main>
    );
}