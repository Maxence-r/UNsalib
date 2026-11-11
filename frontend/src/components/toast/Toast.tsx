import type { ReactElement } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import "./Toast.css";
import { useToastStore } from "./ToastHook";

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
}): ReactElement {
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

function ToastProvider({ zIndex }: { zIndex: number }): ReactElement {
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

export { ToastProvider };
