import { create } from "zustand";
import { JSX } from "react";

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