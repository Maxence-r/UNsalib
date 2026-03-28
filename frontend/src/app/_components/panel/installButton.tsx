"use client";

import { Download } from "lucide-react";

import { useInstallationStore } from "../../_utils/store";
import { promptPwaInstallation, usePwaInstallPromptStore } from "../../_utils/pwa-install";
import { showBrowserInstallHelpModal, showSafariInstallModal } from "./installPromptModal";

export default function PWAInstallButton() {
    const hideInstallBadge = useInstallationStore((state) => state.installationDismissed);
    const dismissInstallation = useInstallationStore((state) => state.dismissInstallation);
    const isInstalled = useInstallationStore((state) => state.isInstalled);
    const isStorageHydrated = useInstallationStore((state) => state.hasHydrated);
    const isBrowserPwaCapable = usePwaInstallPromptStore((state) => state.isBrowserPwaCapable);
    const isSafariInstallable = usePwaInstallPromptStore((state) => state.isSafariInstallable);
    const isStandalone = usePwaInstallPromptStore((state) => state.isStandalone);

    async function handleInstallClick() {
        dismissInstallation();

        if (isSafariInstallable) {
            showSafariInstallModal();
            return;
        }

        const installOutcome = await promptPwaInstallation();

        if (installOutcome === "unavailable") {
            showBrowserInstallHelpModal();
        }
    }

    return (
        <div
            className="install"
            onClick={() => {
                void handleInstallClick();
            }}
            style={{ display: isStorageHydrated && !isInstalled && !isStandalone && isBrowserPwaCapable ? "flex" : "none" }}
        >
            <Download size={16} />
            <span className="badge" style={{ display: !isStorageHydrated || hideInstallBadge ? "none" : "block" }}></span>
        </div>
    );
}
