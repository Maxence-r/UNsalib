"use client";

import { useEffect } from "react";
import Panel from "./_components/panel/panel";
import Calendar from "./_components/calendar/calendar";
import Modal from "@/_components/modal";
import Drawer from "@/_components/drawer";
import Toast from "@/_components/toast";
import { ApiRoomsList } from "@/_utils/api-types";
import NavigationManager from "@/_utils/navigation-manager";
import { redirect, RedirectType } from 'next/navigation';
import { initializeVisitTracking } from "@/_utils/feedback-tracker";

export default function App({ prefetchedRoomsList }: { prefetchedRoomsList: ApiRoomsList }) {
    useEffect(() => {
        // Initialize visit tracking for feedback system
        initializeVisitTracking();
    }, []);

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
                <Drawer />
                <Toast />
            </main>
        </NavigationManager>
    );
}