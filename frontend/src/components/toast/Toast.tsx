import { create } from "zustand";

import "../../utils/theme.css";
import "./Toast.css";

interface ToastState {
    isOpen: boolean,
    error: boolean,
    message: string,
    timeoutId: ReturnType<typeof setTimeout> | undefined
};

const useToastStore = create<ToastState>()(() => ({
    isOpen: false,
    error: false,
    message: "",
    timeoutId: undefined
}));

function hideToast() {
    useToastStore.setState(() => {
        return { isOpen: false };
    });
}

function setToastTimeoutId(id: ReturnType<typeof setTimeout> | undefined) {
    useToastStore.setState(() => {
        return { timeoutId: id };
    });
}

export function showToast() {
    useToastStore.setState(() => {
        setToastTimeoutId(setTimeout(hideToast, 4000));
        return { isOpen: true };
    });
}

export function setToastMessage(message: string, error: boolean = false) {
    useToastStore.setState(() => {
        return { message: message, error: error };
    });
}

export default function Toast() {
    const isToastOpen = useToastStore(state => state.isOpen);
    const isErrorToast = useToastStore(state => state.error);
    const toastMessage = useToastStore(state => state.message);
    const toastTimeoutId = useToastStore(state => state.timeoutId);

    return (
        <div
            className={`toast ${isToastOpen ? "active" : ""} ${isErrorToast ? "error" : ""}`}
            onClick={() => {
                if (toastTimeoutId != undefined) {
                    clearTimeout(toastTimeoutId);
                    setToastTimeoutId(undefined);
                    hideToast();
                }
            }}
        >
            <p>{toastMessage}</p>
        </div>
    )
}

Toast.defaultProps = { error: false, show: false };