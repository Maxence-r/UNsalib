import { create } from "zustand";

interface PanelState {
    isOpened: boolean;
    open: () => void;
    close: () => void;
}

export const usePanelStore = create<PanelState>()((set) => ({
    isOpened: true,
    open: (): void => set({ isOpened: true }),
    close: (): void => set({ isOpened: false }),
}));

interface CurrentRoomStore {
    room: { id: string; name: string } | null;
    setRoom: (id: string, name: string) => void;
}

const useCurrentRoomStore = create<CurrentRoomStore>()((set) => ({
    room: null,
    setRoom: (id: string, name: string): void =>
        set({ room: { id: id, name: name } }),
}));

export { useCurrentRoomStore };
