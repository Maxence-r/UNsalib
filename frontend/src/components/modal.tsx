import "./modal.css";
import "../theme.css";
import { ReactNode } from "react";

export default function Modal({ children, isOpened, closeFunction }: { children: ReactNode, isOpened: boolean, closeFunction: () => void }) {
    return (
        <div
            tabIndex={-1}
            className={`modal ${isOpened ? "active" : ""}`}
            onClick={(event) => {
                const target = event.target as HTMLInputElement;
                if (target.classList.contains("modal")) {
                    closeFunction();
                }
            }}
        >
            <div className="modal-content">
                {children}
            </div>
        </div>
    )
}