"use client";

import { ReactNode, useEffect, useState } from "react";
import { create } from "zustand";

import { useHistoryStore } from "@/app/_utils/store";
import "@/_utils/theme.css";
import "./modal.css";

interface ModalState {
    isOpen: boolean,
    content: ReactNode,
    open: () => void,
    close: () => void,
    setContent: (newContent: ReactNode) => void
};

export const useModalStore = create<ModalState>()((set) => ({
    isOpen: false,
    content: <></>,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    setContent: (newContent) => set({ content: newContent })
}));

export default function Modal() {
    const closeModal = useModalStore(state => state.close);
    const isModalOpen = useModalStore(state => state.isOpen);
    const modalContent = useModalStore(state => state.content);
    const historyStackPush = useHistoryStore((state) => state.push);
    const historyStackPop = useHistoryStore((state) => state.pop);
    const historyStack = useHistoryStore((state) => state.stack);
    const [openStateHistory, setOpenStateHistory] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            setOpenStateHistory(true);
            window.history.pushState({ modalOpened: true }, "");
            historyStackPush("modalOpened");

            const handlePopState = () => {
                if (historyStack[historyStack.length - 1] == "modalOpened" && isModalOpen) {
                    historyStackPop();
                    closeModal();
                }
            };

            window.addEventListener("popstate", handlePopState);

            return () => {
                window.removeEventListener("popstate", handlePopState);
            }
        } else if (!isModalOpen && openStateHistory) {
            setOpenStateHistory(false);
            if (historyStack[historyStack.length - 1] == "modalOpened") {
                historyStackPop();
            }
        }
    }, [isModalOpen, closeModal]);

    return (
        <div
            tabIndex={-1}
            className={`modal ${isModalOpen ? "active" : ""}`}
            onClick={(event) => {
                const target = event.target as HTMLInputElement;
                if (target.classList.contains("modal")) {
                    closeModal();
                }
            }}
        >
            <div className="modal-content">
                {modalContent}
            </div>
        </div>
    );
}