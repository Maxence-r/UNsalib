import "./button.css";
import "../theme.css";
import { ReactNode } from "react";
import Image from "next/image";

export default function Button({ className, children, iconPath, onClick }: { className: string, children: ReactNode, iconPath: string, onClick: React.MouseEventHandler<HTMLButtonElement> }) {
    return (
        <button className={`button ${className}`} onClick={onClick}>
            {iconPath ? <Image className="button__icon" src={iconPath} alt="" height={24} width={24}></Image> : <></>}
            <span className="button__text">{children}</span>
        </button>
    );
}

Button.defaultProps = { className: "", iconPath: "", onClick: (() => { }) };