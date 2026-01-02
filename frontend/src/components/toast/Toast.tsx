import { useCallback } from "react";
import { create } from "zustand";
import { CircleAlert, CircleCheck } from "lucide-react";

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

    hideOldest: () =>
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
    add: (message, isError) => {
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
    remove: (id) =>
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

function Toast({
    message,
    isError,
    isHidden,
    isEntering,
    close,
}: {
    message: string;
    isError: boolean;
    isHidden: boolean;
    isEntering: boolean;
    close: () => void;
}) {
    let classes = "toast";
    classes += isError ? " error" : "";
    classes += isHidden ? " hidden" : "";
    classes += isEntering ? " entering" : "";

    return (
        <div className={classes} onClick={close}>
            {isError ? (
                <CircleAlert size={16} strokeWidth={2.25} />
            ) : (
                <CircleCheck size={16} strokeWidth={2.25} />
            )}
            <span>{message}</span>
        </div>
    );
}

function ToastProvider({ zIndex }: { zIndex: number }) {
    const toasts = useToastStore((s) => s.toasts);
    const hideOldest = useToastStore((s) => s.hideOldest);

    return (
        <div className="toasts" style={{ zIndex: zIndex }}>
            {[...toasts].reverse().map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    isError={toast.isError}
                    isHidden={toast.isHidden}
                    isEntering={toast.isEntering}
                    close={hideOldest}
                />
            ))}
        </div>
    );
}

function useToast() {
    const add = useToastStore((s) => s.add);

    const open = useCallback(
        (message: string, isError = true) => {
            add(message, isError);
        },
        [add],
    );

    return { open };
}

// eslint-disable-next-line react-refresh/only-export-components
export { ToastProvider, useToast };
