import { create } from "zustand";
import { persist } from "zustand/middleware";

interface InstallationStore {
    isInstalled: boolean,
    pwaPrompt: boolean,
    installationDismissed: boolean,
    setInstallation: (state: boolean) => void,
    dismissInstallation: () => void,
    setPwaPrompt: (value: boolean) => void,
    hasHydrated: boolean,
    setHasHydrated: (state: boolean) => void
}

export const useInstallationStore = create<InstallationStore>()(
    persist(
        (set) => ({
            isInstalled: false,
            pwaPrompt: false,
            installationDismissed: false,
            setInstallation: (state: boolean) => set({ isInstalled: state }),
            dismissInstallation: () => set({ installationDismissed: true }),
            setPwaPrompt: (value: boolean) => set({ pwaPrompt: value }),
            hasHydrated: false,
            setHasHydrated: (state: boolean) => set({ hasHydrated: state })
        }),
        {
            name: "unsalib-installation",
            onRehydrateStorage: (state) => (() => state.setHasHydrated(true))
        }
    )
);

interface VersionStore {
    v2Prompt: boolean,
    setV2Prompt: () => void,
    hasHydrated: boolean,
    setHasHydrated: (state: boolean) => void
}

export const useVersionStore = create<VersionStore>()(
    persist(
        (set) => ({
            v2Prompt: false,
            setV2Prompt: () => set({ v2Prompt: true }),
            hasHydrated: false,
            setHasHydrated: (state: boolean) => set({ hasHydrated: state })
        }),
        {
            name: "unsalib-version",
            onRehydrateStorage: (state) => (() => state.setHasHydrated(true))
        }
    )
);

interface PanelState {
    isOpened: boolean,
    open: () => void,
    close: () => void
};

export const usePanelStore = create<PanelState>()((set) => ({
    isOpened: true,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false }),
}));

interface SelectedRoomState {
    room: { id: string, name: string },
    setRoom: (newId: string, newName: string) => void
};

export const useSelectedRoomStore = create<SelectedRoomState>()((set) => ({
    room: { id: "", name: "" },
    setRoom: (newId: string, newName: string) => set({ room: { id: newId, name: newName } })
}));