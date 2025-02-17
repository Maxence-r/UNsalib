import "./modal.css";
import { ReactNode, Dispatch, SetStateAction } from "react";

interface ModalStateContextType {
    isModalOpened: boolean, 
    setModalState: Dispatch<SetStateAction<boolean>>
};

export default function Modal({ children, modalStateContext }: { children: ReactNode, modalStateContext: ModalStateContextType }) {
    const { isModalOpened, setModalState } = modalStateContext;

    return (
        <div
            tabIndex={-1}
            className={`modal ${isModalOpened ? "active" : ""}`}
            onClick={(event) => {
                let target = event.target as HTMLInputElement;
                if (target.classList.contains("modal")) {
                    setModalState(false);
                }
            }}
        >
            <div className="modal-content">
                {children}
            </div>
        </div>
    )
}