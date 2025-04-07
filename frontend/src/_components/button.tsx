import "./button.css";
import "@/_utils/theme.css";
import { ReactNode } from "react";
import Image from "next/image";

export default function Button({ className, children, withIcon, icon, onClick, id }: { className: string, children: ReactNode, withIcon: boolean, icon: ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement>, id: string }) {
    return (
        <button id={id} className={`button ${className}`} onClick={onClick}>
            {withIcon ? icon : <></>}
            <span>{children}</span>
        </button>
    );
}

Button.defaultProps = { className: "", withIcon: false, icon: <></>, onClick: (() => { }), id: "" };