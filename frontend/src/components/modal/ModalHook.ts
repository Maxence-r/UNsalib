import {
    useCallback,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import { create } from "zustand";

interface ModalStore {
    modals: { [id: string]: { contentRef: React.RefObject<ReactNode> } };
    openModalsStack: string[];
    register: (id: string, contentRef: React.RefObject<ReactNode>) => void;
    unregister: (id: string) => void;
    open: (id: string) => void;
    close: (id: string) => void;
}

const useModalStore = create<ModalStore>()((set) => ({
    modals: {},
    openModalsStack: [],

    register: (id, contentRef): void =>
        set((state) => {
            if (Object.keys(state.modals).includes(id))
                console.warn(`Duplicate modal ids found: ${id}`);

            return {
                modals: { [id]: { contentRef }, ...state.modals },
            };
        }),
    unregister: (id): void =>
        set((state) => {
            delete state.modals[id];
            return {
                modals: state.modals,
            };
        }),
    open: (id): void =>
        set((state) => ({ openModalsStack: [id, ...state.openModalsStack] })),
    close: (id): void =>
        set((state) => ({
            openModalsStack: state.openModalsStack.filter(
                (modalId) => modalId != id,
            ),
        })),
}));

function useModal(
    id: string,
    content: ReactNode,
): {
    open: () => void;
} {
    const register = useModalStore((s) => s.register);
    const unregister = useModalStore((s) => s.unregister);
    const open = useModalStore((s) => s.open);

    // Avoid loop re-renders when content use useModal
    const contentRef = useRef<ReactNode>(content);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    useEffect(() => {
        register(id, contentRef);

        return (): void => unregister(id);
    }, [id, register, unregister]);

    const openModal = useCallback(() => open(id), [id, open]);

    return { open: openModal };
}

export { useModal, useModalStore };
