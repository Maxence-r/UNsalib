import "./button.css";
import { ReactNode } from "react";

export default function Button({ className, children, onClick }: { className: string, children: ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement> }) {
    return (
        <button className={`button ${className}`} onClick={onClick}>
            <span className="button__text">{children}</span>
        </button>
    );
}

Button.defaultProps = { className: "", onClick: (() => { }) };