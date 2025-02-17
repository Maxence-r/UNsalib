"use client";
import { createContext, JSX } from "react";

const SelectedRoomContext = createContext({
    selectedRoomId: "",
    setSelectedRoomId: (roomId: string) => { }
});

const LoadingTimetableContext = createContext({
    loadingTimetable: false,
    setLoadingTimetable: (state: boolean) => { }
});

const ModalStateContext = createContext({
    isModalOpened: false,
    setModalState: (state: boolean) => { }
});

const ModalContentContext = createContext({
    modalContent: <></>,
    setModalContent: (content: JSX.Element) => { }
});

export { SelectedRoomContext, LoadingTimetableContext, ModalStateContext, ModalContentContext };