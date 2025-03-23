import { ReactNode } from "react";
import "./toast.css";
import "../theme.css";

export default function Toast({ children, error, show }: { children: ReactNode, error: boolean, show: boolean }) {
    return (
        <div className={`notif ${show ? "active" : ""} ${error ? "error" : ""}`}>
            <p>{children}</p>
        </div>
    )
}

Toast.defaultProps = { error: false, show: false };