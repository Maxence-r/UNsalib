"use client";

import Image from "next/image";

import Button from "@/_components/button";
import { closeModal, openModal, setModalContent, setModalPresentation } from "@/_components/modal";
import { promptPwaInstallation, usePwaInstallPromptStore } from "../../_utils/pwa-install";
import { useInstallationStore } from "../../_utils/store";
import "./installPromptModal.css";

function BrowserInstallHelpModalContent() {
    return (
        <div className="installGuideModal">
            <h2 className="installGuideModal__title">Installer UNsalib sur votre navigateur</h2>
            <p className="installGuideModal__description">
                Si la fen&ecirc;tre d&apos;installation ne s&apos;ouvre pas automatiquement, vous pouvez quand m&ecirc;me installer UNsalib depuis le navigateur.
            </p>
            <div className="installGuideModal__steps">
                <div className="installGuideModal__step">
                    <p>1. Cherchez l&apos;ic&ocirc;ne d&apos;installation dans la barre d&apos;adresse.</p>
                </div>
                <div className="installGuideModal__step">
                    <p>2. Sinon, ouvrez le menu du navigateur puis choisissez &quot;Installer l&apos;application&quot;.</p>
                </div>
            </div>
            <Button className="installGuideModal__button" onClick={() => closeModal()}>
                Compris !
            </Button>
        </div>
    );
}

function SafariInstallModalContent() {
    return (
        <div className="safariInstallModal">
            <h2 className="safariInstallModal__title">Installer UNsalib sur iPhone et iPad</h2>
            <p className="safariInstallModal__description">
                Sur iOS et iPadOS, l&apos;installation se fait directement dans Safari. Touchez le bouton de partage, puis choisissez &quot;Sur l&apos;&eacute;cran d&apos;accueil&quot; pour retrouver UNsalib comme une application.
            </p>
            <div className="safariInstallModal__steps">
                <div className="safariInstallModal__step">
                    <p>1. Touchez le bouton &quot;Partager&quot; dans Safari</p>
                    <Image src="/share.svg" alt="" width={24} height={24} />
                </div>
                <div className="safariInstallModal__step">
                    <p>2. Choisissez &quot;Sur l&apos;&eacute;cran d&apos;accueil&quot;</p>
                    <Image src="/add.svg" alt="" width={21} height={22} />
                </div>
            </div>
            <Button className="safariInstallModal__button" onClick={() => closeModal()}>
                Compris !
            </Button>
        </div>
    );
}

export function swapToSafariInstallModal() {
    setModalPresentation();
    setModalContent(<SafariInstallModalContent />);
}

export function showSafariInstallModal() {
    swapToSafariInstallModal();
    openModal();
}

export function swapToBrowserInstallHelpModal() {
    setModalPresentation();
    setModalContent(<BrowserInstallHelpModalContent />);
}

export function showBrowserInstallHelpModal() {
    swapToBrowserInstallHelpModal();
    openModal();
}

export function showInstallPromptModal() {
    setModalPresentation({
        modalClassName: "installPromptModal",
        contentClassName: "modal-content--installPrompt",
        closeOnBackdropClick: false
    });
    setModalContent(<InstallPromptModalContent />);
    openModal();
}

export default function InstallPromptModalContent() {
    const dismissInstallation = useInstallationStore((state) => state.dismissInstallation);
    const isSafariInstallable = usePwaInstallPromptStore((state) => state.isSafariInstallable);

    async function handleInstallAction() {
        dismissInstallation();

        if (isSafariInstallable) {
            swapToSafariInstallModal();
            return;
        }

        const installOutcome = await promptPwaInstallation();

        if (installOutcome === "unavailable") {
            swapToBrowserInstallHelpModal();
            return;
        }

        if (installOutcome === "accepted") {
            closeModal();
        }
    }

    return (
        <div className="installPromptSheet">
            <Image
                className="installPromptSheet__artwork"
                src="/install-prompt-browsers.png"
                alt="Apercu des navigateurs compatibles avec l'installation de l'application."
                width={323}
                height={116}
                priority
            />
            <div className="installPromptSheet__body">
                <button
                    type="button"
                    className="installPromptSheet__dismiss"
                    onClick={() => {
                        dismissInstallation();
                        closeModal();
                    }}
                >
                    Non merci
                </button>
                <Button
                    className="installPromptSheet__cta"
                    onClick={() => {
                        void handleInstallAction();
                    }}
                >
                    Installer l&apos;application !
                </Button>
                {isSafariInstallable ? (
                    <p className="installPromptSheet__helper">
                        Sur iPhone et iPad, l&apos;installation se fait dans Safari via Partager puis &quot;Sur l&apos;&eacute;cran d&apos;accueil&quot;.
                    </p>
                ) : null}
            </div>
        </div>
    );
}
