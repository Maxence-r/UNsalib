import { ReactNode } from "react";
import "./toast.css";

export default function Toast({ children, error, show }: { children: ReactNode, error: boolean, show: boolean }) {
    return (
        <div className={`notif ${show ? "active" : ""}`} style={{ backgroundColor: error ? "red" : "green" }}>
            <p>{children}</p>
        </div>
    )
}

Toast.defaultProps = { error: false, show: false };