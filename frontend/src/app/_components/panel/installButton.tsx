"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

import { useInstallationStore } from "../../store";
import Button from "@/_components/button";
import { closeModal, openModal, setModalContent } from "@/_components/modal";

function SafariInstallModalContent() {
    return (
        <div className="safariInstall">
            <div className="option">
                <p>1. Cliquez sur le bouton &quot;Partager&quot;</p>
                <Image src="/share.svg" alt="" width={24} height={24}></Image>
            </div>
            <div className="option">
                <p>2. Cliquez sur &quot;Sur l&apos;écran d&apos;accueil&quot;</p>
                <Image src="/add.svg" alt="" width={21} height={22}></Image>
            </div>
            <Button onClick={() => closeModal()}>Compris !</Button>
        </div>
    );
}

export default function PWAInstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [isSafari, setIsSafari] = useState(false);
    const pwaPrompt = useInstallationStore((state) => state.pwaPrompt);
    const setPwaPrompt = useInstallationStore((state) => state.setPwaPrompt);
    const hideInstallBadge = useInstallationStore((state) => state.installationDismissed);
    const dismissInstallation = useInstallationStore((state) => state.dismissInstallation);
    const isStorageHydrated = useInstallationStore((state) => state.hasHydrated);
    // const isAppInstalled = useInstallationStore((state) => state.isInstalled);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === "accepted") {
                console.log("The user has approved the installation of the PWA");
                setDeferredPrompt(null);
                setPwaPrompt(false);
            } else {
                console.log("The user has denied the installation of the PWA");
            }
        }
    };

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

    useEffect(() => {
        const ua = window.navigator.userAgent;
        const isIos = /iPad|iPhone|iPod/.test(ua);
        const isIpadOs = ua.toLowerCase().indexOf('macintosh') > -1 && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
        const isWebkit = /WebKit/i.test(ua);
        if ((isIos || isIpadOs) && isWebkit) { // Safari on iOS
            setIsSafari(true);
        } else if (pwaPrompt) {
            setIsSupported(true);
        }
    }, []);

    return (
        <div className="install"
            onClick={() => {
                dismissInstallation();
                if (isSafari) {
                    setModalContent(<SafariInstallModalContent></SafariInstallModalContent>);
                    openModal();
                } else {
                    handleInstallClick();
                }
            }}
            style={{ display: isStorageHydrated && (!window.matchMedia("(display-mode: standalone)").matches && (isSupported || isSafari)) ? "flex" : "none" }}
        >
            <Download size={16} />
            <span className="badge" style={{ display: !isStorageHydrated || hideInstallBadge ? "none" : "block" }}></span>
        </div>
    );
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => void;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
