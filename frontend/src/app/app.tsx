"use client";

import { useEffect } from "react";

import Panel from "./_components/panel/panel";
import Calendar from "./_components/calendar/calendar";
import Modal from "@/_components/modal";
import Toast from "@/_components/toast";
import { ApiRoomsList } from "@/_utils/api-types";
import { useVersionStore } from "./store";
import NavigationManager from "@/_utils/navigation-manager";

export default function App({ prefetchedRoomsList }: { prefetchedRoomsList: ApiRoomsList }) {
    const isStorageHydrated = useVersionStore((state) => state.hasHydrated);
    const v2Prompt = useVersionStore((state) => state.v2Prompt);
    const setV2Prompt = useVersionStore((state) => state.setV2Prompt);

    useEffect(() => {
        if (isStorageHydrated && !v2Prompt) {
            setV2Prompt();
            window.location.href = "/new";
        }
    }, [isStorageHydrated]);

    return (
        <NavigationManager>
            <main tabIndex={-1} className="main">
                <section className="no-compatible">
                    <p>Votre écran est orienté dans le mauvais sens ou trop petit.</p>
                </section>
                <Panel roomsList={prefetchedRoomsList} />
                <Calendar />
                <Modal />
                <Toast />
            </main>
        </NavigationManager>
    );
}