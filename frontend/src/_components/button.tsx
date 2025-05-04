import { ReactNode } from "react";

import "./button.css";
import "@/_utils/theme.css";

export default function Button({ 
    className, 
    children, 
    withIcon, 
    iconOnly, 
    icon, 
    onClick, 
    id, 
    secondary,
    disabled
}: { 
    className: string, 
    children: ReactNode, 
    withIcon: boolean, 
    iconOnly: boolean, 
    icon: ReactNode, 
    onClick: React.MouseEventHandler<HTMLButtonElement>, 
    id: string,
    secondary: boolean,
    disabled: boolean
}) {
    return (
        <button id={id} disabled={disabled} className={`button ${secondary ? "secondary " : ""}${className}`} onClick={onClick}>
            {withIcon ? icon : <></>}
            {!iconOnly ? <span>{children}</span> : <></>}
        </button>
    );
}

Button.defaultProps = { 
    className: "", 
    withIcon: false, 
    iconOnly: false, 
    icon: <></>, 
    onClick: (() => { }), 
    id: "", 
    secondary: false, 
    disabled: false 
};