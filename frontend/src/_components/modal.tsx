"use client";

import { ReactNode } from "react";
import { create } from "zustand";

import "@/_utils/theme.css";
import "./modal.css";
import { pushToHistory, goBack } from "@/_utils/navigation-manager";

interface ModalState {
    isOpen: boolean,
    content: ReactNode
};

const useModalStore = create<ModalState>()(() => ({
    isOpen: false,
    content: <></>
}));

export function openModal() {
    console.log("push")
    pushToHistory("modal", onlyCloseModal);
    useModalStore.setState(() => {
        return { isOpen: true };
    });
}

function onlyCloseModal() {
    useModalStore.setState(() => {
        return { isOpen: false };
    });
}

export function closeModal() {
    goBack();
}

export function setModalContent(newContent: ReactNode) {
    useModalStore.setState(() => {
        return { content: newContent };
    });
}

export default function Modal() {
    const isModalOpen = useModalStore(state => state.isOpen);
    const modalContent = useModalStore(state => state.content);

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