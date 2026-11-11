import { useCallback } from "react";
import { create } from "zustand";

import "./Toast.css";

interface ToastData {
    id: number;
    message: string;
    isError: boolean;
    isHidden: boolean;
    isEntering: boolean;
    timeoutId: ReturnType<typeof setTimeout>;
    enteringTimeoutId: ReturnType<typeof setTimeout>;
}

interface ToastStore {
    toasts: ToastData[];
    hideOldest: () => void;
    add: (message: string, isError: boolean) => void;
    remove: (id: number) => void;
}

const TOAST_DURATION = 3000;
const ENTER_ANIMATION_DURATION = 400;
const EXIT_ANIMATION_DURATION = 400;

let toastIdCounter = 0;

const useToastStore = create<ToastStore>()((set, get) => ({
    toasts: [],

    hideOldest: (): void =>
        set((state) => {
            const oldestVisible = state.toasts.find((t) => !t.isHidden);
            if (!oldestVisible) return state;

            // Set up deletion after the exit animation
            setTimeout(
                () => get().remove(oldestVisible.id),
                EXIT_ANIMATION_DURATION,
            );

            return {
                toasts: state.toasts.map((toast) =>
                    toast.id === oldestVisible.id
                        ? { ...toast, isHidden: true }
                        : toast,
                ),
            };
        }),
    add: (message, isError): void => {
        const id = ++toastIdCounter;

        // Hide the toast after a certain amount of time
        const timeoutId = setTimeout(get().hideOldest, TOAST_DURATION);

        // Disable the entering animation after a certain amount of time
        const enteringTimeoutId = setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.map((toast) =>
                    toast.id === id ? { ...toast, isEntering: false } : toast,
                ),
            }));
        }, ENTER_ANIMATION_DURATION);

        set((state) => ({
            toasts: [
                ...state.toasts,
                {
                    id,
                    message,
                    isError,
                    isHidden: false,
                    isEntering: true,
                    timeoutId,
                    enteringTimeoutId,
                },
            ],
        }));
    },
    remove: (id): void =>
        set((state) => {
            const toast = state.toasts.find((t) => t.id === id);
            if (toast) {
                clearTimeout(toast.timeoutId);
                clearTimeout(toast.enteringTimeoutId);
            }
            return {
                toasts: state.toasts.filter((t) => t.id !== id),
            };
        }),
}));

function useToast(): {
    open: (message: string, isError?: boolean) => void;
} {
    const add = useToastStore((s) => s.add);

    const open = useCallback(
        (message: string, isError = true) => {
            add(message, isError);
        },
        [add],
    );

    return { open };
}

export { useToast, useToastStore };