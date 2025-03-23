"use client";

import { useEffect, useState } from "react";
import { useInstallationStore } from "./store";
import Image from "next/image";

export default function PWAInstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const pwaPrompt = useInstallationStore((state) => state.pwaPrompt);
    const setPwaPrompt = useInstallationStore((state) => state.setPwaPrompt);
    const hideInstallBadge = useInstallationStore((state) => state.installationDismissed);
    const dismissInstallation = useInstallationStore((state) => state.dismissInstallation);
    const isStorageHydrated = useInstallationStore((state) => state.hasHydrated);
    const isAppInstalled = useInstallationStore((state) => state.isInstalled);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsSupported(true);
            setPwaPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === "accepted") {
                console.log("L'utilisateur a accepté l'installation de la PWA.");
                setDeferredPrompt(null);
                setPwaPrompt(false);
            } else {
                console.log("L'utilisateur a refusé l'installation de la PWA.");
            }
        }
    };

    useEffect(() => { if (pwaPrompt) setIsSupported(true) }, []);

    return (
        <div className="install"
            onClick={() => {
                dismissInstallation();
                handleInstallClick();
            }}
            style={{ display: !isSupported || !isStorageHydrated || isAppInstalled ? "none" : "flex" }}
        >
            <Image src="/download.svg" width={24} height={24} alt="Installer l'application"></Image>
            <span className="badge" style={{ display: !isStorageHydrated || hideInstallBadge ? "none" : "block" }}></span>
        </div>
    );
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => void;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
