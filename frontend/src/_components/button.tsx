import "./button.css";
import "@/_utils/theme.css";
import { ReactNode } from "react";

export default function Button({ className, children, withIcon, iconOnly, icon, onClick, id }: { className: string, children: ReactNode, withIcon: boolean, iconOnly: boolean, icon: ReactNode, onClick: React.MouseEventHandler<HTMLButtonElement>, id: string }) {
    return (
        <button id={id} className={`button ${className}`} onClick={onClick}>
            {withIcon ? icon : <></>}
            {!iconOnly ? <span>{children}</span> : <></>}
        </button>
    );
}

Button.defaultProps = { className: "", withIcon: false, iconOnly: false, icon: <></>, onClick: (() => { }), id: "" };