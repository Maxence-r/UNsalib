"use client";
import { ReactNode, useState } from "react";
import { SelectedRoomContext, LoadingTimetableContext, ModalStateContext, ModalContentContext } from "./contexts";
import Modal from "@/components/modal";

export default function ContextProvider({ children }: { children: ReactNode }) {
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const selectedRoomIdValue = { selectedRoomId, setSelectedRoomId };
    const [loadingTimetable, setLoadingTimetable] = useState(false);
    const loadingTimetableValue = { loadingTimetable, setLoadingTimetable };
    const [isModalOpened, setModalState] = useState(false);
    const isModalOpenedValue = { isModalOpened, setModalState };
    const [modalContent, setModalContent] = useState(<></>);
    const modalContentValue = { modalContent, setModalContent };

    return (
        <SelectedRoomContext.Provider value={selectedRoomIdValue}>
            <LoadingTimetableContext.Provider value={loadingTimetableValue}>
                <ModalStateContext.Provider value={isModalOpenedValue}>
                    <ModalContentContext.Provider value={modalContentValue}>
                        {children}
                        <Modal modalStateContext={isModalOpenedValue}>{modalContent}</Modal>
                    </ModalContentContext.Provider>
                </ModalStateContext.Provider>
            </LoadingTimetableContext.Provider>
        </SelectedRoomContext.Provider>
    );
}