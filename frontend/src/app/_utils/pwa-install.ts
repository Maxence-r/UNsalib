"use client";

import { useEffect } from "react";
import { create } from "zustand";

import { isLikelyPwaCapableUserAgent } from "@/_utils/install-prompt";
import { useInstallationStore } from "./store";

export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallPromptState {
    deferredPrompt: BeforeInstallPromptEvent | null,
    isPromptSupported: boolean,
    isSafariInstallable: boolean,
    isBrowserPwaCapable: boolean,
    isStandalone: boolean,
    setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void,
    setPromptSupported: (state: boolean) => void,
    setSafariInstallable: (state: boolean) => void,
    setBrowserPwaCapable: (state: boolean) => void,
    setStandalone: (state: boolean) => void,
    reset: () => void
}

export const usePwaInstallPromptStore = create<PwaInstallPromptState>()((set) => ({
    deferredPrompt: null,
    isPromptSupported: false,
    isSafariInstallable: false,
    isBrowserPwaCapable: false,
    isStandalone: false,
    setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => set({ deferredPrompt: prompt }),
    setPromptSupported: (state: boolean) => set({ isPromptSupported: state }),
    setSafariInstallable: (state: boolean) => set({ isSafariInstallable: state }),
    setBrowserPwaCapable: (state: boolean) => set({ isBrowserPwaCapable: state }),
    setStandalone: (state: boolean) => set({ isStandalone: state }),
    reset: () => set({
        deferredPrompt: null,
        isPromptSupported: false
    })
}));

export function isRunningStandalone() {
    if (typeof window === "undefined") {
        return false;
    }

    return window.matchMedia("(display-mode: standalone)").matches
        || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function usePwaInstallPromptSetup() {
    const setDeferredPrompt = usePwaInstallPromptStore((state) => state.setDeferredPrompt);
    const setPromptSupported = usePwaInstallPromptStore((state) => state.setPromptSupported);
    const setSafariInstallable = usePwaInstallPromptStore((state) => state.setSafariInstallable);
    const setBrowserPwaCapable = usePwaInstallPromptStore((state) => state.setBrowserPwaCapable);
    const setStandalone = usePwaInstallPromptStore((state) => state.setStandalone);
    const resetPromptState = usePwaInstallPromptStore((state) => state.reset);
    const setInstallation = useInstallationStore((state) => state.setInstallation);

    useEffect(() => {
        const installEventHandler = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
            setPromptSupported(true);
        };

        const appInstalledHandler = () => {
            setInstallation(true);
            setStandalone(true);
            resetPromptState();
        };

        window.addEventListener("beforeinstallprompt", installEventHandler);
        window.addEventListener("appinstalled", appInstalledHandler);

        return () => {
            window.removeEventListener("beforeinstallprompt", installEventHandler);
            window.removeEventListener("appinstalled", appInstalledHandler);
        };
    }, [resetPromptState, setDeferredPrompt, setInstallation, setPromptSupported, setStandalone]);

    useEffect(() => {
        const userAgent = window.navigator.userAgent;
        const isIos = /iPad|iPhone|iPod/.test(userAgent);
        const isIpadOs = userAgent.toLowerCase().includes("macintosh") && navigator.maxTouchPoints > 2;
        const isWebkit = /WebKit/i.test(userAgent);

        setSafariInstallable((isIos || isIpadOs) && isWebkit);
        setBrowserPwaCapable(isLikelyPwaCapableUserAgent(userAgent));
    }, [setBrowserPwaCapable, setSafariInstallable]);

    useEffect(() => {
        const displayMode = window.matchMedia("(display-mode: standalone)");
        const legacyDisplayMode = displayMode as MediaQueryList & {
            addListener?: (listener: (event: MediaQueryListEvent) => void) => void,
            removeListener?: (listener: (event: MediaQueryListEvent) => void) => void
        };

        const updateStandaloneState = () => {
            setStandalone(isRunningStandalone());
        };

        updateStandaloneState();
        setInstallation(isRunningStandalone());
        if (typeof displayMode.addEventListener === "function") {
            displayMode.addEventListener("change", updateStandaloneState);
        } else {
            legacyDisplayMode.addListener?.(updateStandaloneState);
        }

        return () => {
            if (typeof displayMode.removeEventListener === "function") {
                displayMode.removeEventListener("change", updateStandaloneState);
            } else {
                legacyDisplayMode.removeListener?.(updateStandaloneState);
            }
        };
    }, [setInstallation, setStandalone]);
}

export async function promptPwaInstallation() {
    const deferredPrompt = usePwaInstallPromptStore.getState().deferredPrompt;

    if (!deferredPrompt) {
        return "unavailable";
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
        useInstallationStore.getState().setInstallation(true);
        usePwaInstallPromptStore.getState().reset();
    }

    return choiceResult.outcome;
}
