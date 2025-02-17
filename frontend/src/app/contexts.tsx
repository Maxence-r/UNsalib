"use client";
import { createContext } from "react";

const SelectedRoomContext = createContext({
    selectedRoomId: "",
    setSelectedRoomId: (roomId: string) => { }
});

export { SelectedRoomContext };