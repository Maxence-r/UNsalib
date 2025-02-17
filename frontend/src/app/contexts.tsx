"use client";
import { createContext } from "react";

const SelectedRoomContext = createContext({
    selectedRoomId: "",
    setSelectedRoomId: (roomId: string) => { }
});

const LoadingTimetableContext = createContext({
    loadingTimetable: false,
    setLoadingTimetable: (state: boolean) => { }
});

export { SelectedRoomContext, LoadingTimetableContext };