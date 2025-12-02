import type { ReactNode } from "react";

import "../../utils/theme.css";
import "./Modal.css";

function Modal({
    isOpen,
    setIsOpen,
    children,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: ReactNode;
}) {
    return (
        <div tabIndex={-1} className={`modal ${isOpen ? "open" : ""}`}>
            <div
                className="scrim"
                onClick={(event) => {
                    event.stopPropagation();
                    const target = event.target as HTMLInputElement;
                    if (target.classList.contains("scrim")) {
                        setIsOpen(false);
                    }
                }}
            />
            <div className="window">{children}</div>
        </div>
    );
}

export { Modal };
