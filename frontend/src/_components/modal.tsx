"use client";

import { ReactNode } from "react";
import { create } from "zustand";

import "@/_utils/theme.css";
import "./modal.css";
import { pushToHistory, goBack } from "@/_utils/navigation-manager";

interface ModalState {
    isOpen: boolean,
    content: ReactNode,
    modalClassName: string,
    contentClassName: string,
    closeOnBackdropClick: boolean
};

const DEFAULT_MODAL_PRESENTATION = {
    modalClassName: "",
    contentClassName: "",
    closeOnBackdropClick: true
};

const useModalStore = create<ModalState>()(() => ({
    isOpen: false,
    content: <></>,
    ...DEFAULT_MODAL_PRESENTATION
}));

export function openModal() {
    pushToHistory("modal", onlyCloseModal);
    useModalStore.setState(() => {
        return { isOpen: true };
    });
}

function onlyCloseModal() {
    useModalStore.setState(() => {
        return {
            isOpen: false,
            content: <></>,
            ...DEFAULT_MODAL_PRESENTATION
        };
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

export function setModalPresentation({
    modalClassName = "",
    contentClassName = "",
    closeOnBackdropClick = true
}: Partial<Pick<ModalState, "modalClassName" | "contentClassName" | "closeOnBackdropClick">> = {}) {
    useModalStore.setState(() => {
        return {
            modalClassName,
            contentClassName,
            closeOnBackdropClick
        };
    });
}

export default function Modal() {
    const isModalOpen = useModalStore(state => state.isOpen);
    const modalContent = useModalStore(state => state.content);
    const modalClassName = useModalStore(state => state.modalClassName);
    const contentClassName = useModalStore(state => state.contentClassName);
    const closeOnBackdropClick = useModalStore(state => state.closeOnBackdropClick);

    return (
        <div
            tabIndex={-1}
            className={`modal ${modalClassName} ${isModalOpen ? "active" : ""}`}
            onClick={(event) => {
                const target = event.target as HTMLInputElement;
                if (closeOnBackdropClick && target.classList.contains("modal")) {
                    closeModal();
                }
            }}
        >
            <div className={`modal-content ${contentClassName}`}>
                {modalContent}
            </div>
        </div>
    );
}
