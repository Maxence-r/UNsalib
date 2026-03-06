import { useEffect, useState, type JSX } from "react";
import { Download } from "lucide-react";

import { IconButton } from "../../../../../components/button/Button.js";
import { SafariInstallModal } from "../modals/SafariInstallModal.js";
import { useModal } from "../../../../../components/modal/Modal.js";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstallButton(): JSX.Element {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const { open: openSafariInstallModal } = useModal(
        "safari-install",
        <SafariInstallModal />,
    );

    const handleButtonClick = async () => {
        if (deferredPrompt) {
            const choiceResult = await deferredPrompt.prompt();
            if (choiceResult.outcome === "accepted") {
                console.log(
                    "The user has approved the installation of the PWA",
                );
                // setDeferredPrompt(null);
            } else {
                console.log("The user has denied the installation of the PWA");
            }
        } else {
            openSafariInstallModal();
        }
    };

    useEffect(() => {
        const promptEventHandler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", promptEventHandler);

        return () =>
            window.removeEventListener(
                "beforeinstallprompt",
                promptEventHandler,
            );
    }, []);

    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const isIpadOs =
        ua.toLowerCase().indexOf("macintosh") > -1 &&
        navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2;
    const isWebkit = /WebKit/i.test(ua);

    if (
        window.matchMedia("(display-mode: standalone)").matches ||
        // Unsupported browser
        (!deferredPrompt && !isIos && !isIpadOs) ||
        !isWebkit
    ) {
        return;
    }

    return (
        <IconButton onClick={handleButtonClick} icon={<Download />} secondary />
    );
}

export { InstallButton };
