"use client";
import { ReactNode, useState } from "react";
import { SelectedRoomContext } from "./contexts";

export default function ContextProvider({ children }: { children: ReactNode }) {
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const value = { selectedRoomId, setSelectedRoomId };

    return (
        <SelectedRoomContext.Provider value={value}>
            {children}
        </SelectedRoomContext.Provider>
    )
}