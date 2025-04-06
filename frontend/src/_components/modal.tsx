"use client";

import { ReactNode, useEffect, useState } from "react";
// import { createPortal } from "react-dom";

import { useHistoryStore } from "@/app/_utils/store";
import "@/_utils/theme.css";
import "./modal.css";

// export function BetaModal({ content }: { content: ReactNode }) {
//     return (
//         <>
//             {/* {createPortal(
//                 <p>This child is placed in the document body.</p>,
//                 document.body
//             )} */}
//         </>
//     );
// }

export default function Modal({ children, isOpened, closeFunction }: { children: ReactNode, isOpened: boolean, closeFunction: () => void }) {
    const historyStackPush = useHistoryStore((state) => state.push);
    const historyStackPop = useHistoryStore((state) => state.pop);
    const historyStack = useHistoryStore((state) => state.stack);
    const [openStateHistory, setOpenStateHistory] = useState(false);

    useEffect(() => {
        if (isOpened) {
            setOpenStateHistory(true);
            window.history.pushState({ modalOpened: true }, "");
            historyStackPush("modalOpened");

            const handlePopState = () => {
                if (historyStack[historyStack.length - 1] == "modalOpened" && isOpened) {
                    historyStackPop();
                    closeFunction();
                }
            };

            window.addEventListener("popstate", handlePopState);

            return () => {
                window.removeEventListener("popstate", handlePopState);
            }
        } else if (!isOpened && openStateHistory) {
            setOpenStateHistory(false);
            if (historyStack[historyStack.length - 1] == "modalOpened") {
                historyStackPop();
            }
        }
    }, [isOpened, closeFunction]);

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