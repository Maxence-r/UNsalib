import { create } from "zustand";
import { JSX } from "react";
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

interface ModalState {
    isOpened: boolean,
    content: JSX.Element,
    open: () => void,
    close: () => void,
    setContent: (newContent: JSX.Element) => void
};

export const useModalStore = create<ModalState>()((set) => ({
    isOpened: false,
    content: <></>,
    open: () => set({ isOpened: true }),
    close: () => set({ isOpened: false }),
    setContent: (newContent) => set({ content: newContent })
}));

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

interface TimetableState {
    isLoading: boolean,
    setLoading: (state: boolean) => void
};

export const useTimetableStore = create<TimetableState>()((set) => ({
    isLoading: false,
    setLoading: (state) => set({ isLoading: state }),
}));

interface ToastState {
    isOpened: boolean,
    isError: boolean,
    content: string,
    open: () => void,
    close: () => void,
    setContent: (newContent: string) => void,
    setError: (state: boolean) => void
};

export const useToastStore = create<ToastState>()((set) => ({
    isOpened: false,
    isError: false,
    content: "",
    open: () => set((state) => {
        setTimeout(() => {
            state.close();
        }, 5000);
        return { isOpened: true };
    }),
    close: () => set({ isOpened: false }),
    setContent: (newContent) => set({ content: newContent }),
    setError: (state) => set({ isError: state }),
}));

interface HistoryState {
    stack: string[],
    push: (value: string) => void,
    pop: () => void
};

export const useHistoryStore = create<HistoryState>()((set) => ({
    stack: [],
    push: (value) => set(state => {
        const newStack = state.stack;
        newStack.push(value);
        return { stack: newStack };
    }),
    pop: () => set(state => {
        const newStack = state.stack;
        newStack.pop();
        return { stack: newStack };
    })
}));