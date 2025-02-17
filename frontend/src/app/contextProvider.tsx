"use client";
import { ReactNode, useState } from "react";
import { SelectedRoomContext, LoadingTimetableContext } from "./contexts";

export default function ContextProvider({ children }: { children: ReactNode }) {
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const selectedRoomIdValue = { selectedRoomId, setSelectedRoomId };
    const [loadingTimetable, setLoadingTimetable] = useState(false);
    const loadingTimetableValue = { loadingTimetable, setLoadingTimetable };

    return (
        <SelectedRoomContext.Provider value={selectedRoomIdValue}>
            <LoadingTimetableContext.Provider value={loadingTimetableValue}>
                {children}
            </LoadingTimetableContext.Provider>
        </SelectedRoomContext.Provider>
    )
}