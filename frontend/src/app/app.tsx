"use client";

import { useCallback, useEffect, useState } from "react";
import Panel from "./_components/panel/panel";
import Calendar from "./_components/calendar/calendar";
import Modal from "@/_components/modal";
import Drawer from "@/_components/drawer";
import Toast from "@/_components/toast";
import { ApiRoomsList } from "@/_utils/api-types";
import {
    INSTALL_PROMPT_SHOWN_COOKIE,
    INSTALL_PROMPT_TRIGGER_COOKIE,
    buildClientCookieString
} from "@/_utils/install-prompt";
import NavigationManager from "@/_utils/navigation-manager";
import { redirect, RedirectType } from 'next/navigation';
import { initializeVisitTracking } from "@/_utils/feedback-tracker";
import { showInstallPromptModal } from "./_components/panel/installPromptModal";
import { isRunningStandalone, usePwaInstallPromptSetup, usePwaInstallPromptStore } from "./_utils/pwa-install";
import { useInstallationStore } from "./_utils/store";

export default function App({ prefetchedRoomsList }: { prefetchedRoomsList: ApiRoomsList }) {
    const [hasPendingInstallPrompt, setHasPendingInstallPrompt] = useState(false);
    const isStorageHydrated = useInstallationStore((state) => state.hasHydrated);
    const isInstalled = useInstallationStore((state) => state.isInstalled);
    const isBrowserPwaCapable = usePwaInstallPromptStore((state) => state.isBrowserPwaCapable);

    usePwaInstallPromptSetup();

    const clearInstallPromptTrigger = useCallback(() => {
        document.cookie = buildClientCookieString(INSTALL_PROMPT_TRIGGER_COOKIE, "", {
            maxAge: 0,
            domain: process.env.NEXT_PUBLIC_DOMAIN
        });
    }, []);

    const markInstallPromptAsShown = useCallback(() => {
        document.cookie = buildClientCookieString(INSTALL_PROMPT_SHOWN_COOKIE, "true", {
            maxAge: 60 * 60 * 24 * 365,
            domain: process.env.NEXT_PUBLIC_DOMAIN
        });
    }, []);

    useEffect(() => {
        // Initialize visit tracking for feedback system
        initializeVisitTracking();
    }, []);

    useEffect(() => {
        const hasInstallPromptTrigger = document.cookie
            .split("; ")
            .some((cookie) => cookie.startsWith(`${INSTALL_PROMPT_TRIGGER_COOKIE}=`));

        if (!hasInstallPromptTrigger) {
            return;
        }

        setHasPendingInstallPrompt(true);
    }, []);

    useEffect(() => {
        if (!hasPendingInstallPrompt || !isStorageHydrated) {
            return;
        }

        if (isRunningStandalone() || isInstalled) {
            markInstallPromptAsShown();
            clearInstallPromptTrigger();
            setHasPendingInstallPrompt(false);
            return;
        }

        if (!isBrowserPwaCapable) {
            return;
        }

        markInstallPromptAsShown();
        clearInstallPromptTrigger();
        setHasPendingInstallPrompt(false);
        showInstallPromptModal();
    }, [clearInstallPromptTrigger, hasPendingInstallPrompt, isBrowserPwaCapable, isInstalled, isStorageHydrated, markInstallPromptAsShown]);

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
