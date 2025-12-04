import { create } from "zustand";

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