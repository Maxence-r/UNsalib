"use client";

import Panel from "./_components/panel/panel";
import Calendar from "./_components/calendar/calendar";
import Modal from "@/_components/modal";
import Toast from "@/_components/toast";
import { ApiRoomsList } from "@/_utils/api-types";
import NavigationManager from "@/_utils/navigation-manager";
import { redirect, RedirectType } from 'next/navigation'

export default function App({ prefetchedRoomsList }: { prefetchedRoomsList: ApiRoomsList }) {
    if (process.env.MAINTENANCE === "true") {
        redirect('/maintenance', RedirectType.replace)
    }
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