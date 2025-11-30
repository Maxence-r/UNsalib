import { cloneElement } from "react";

import "./Button.css";

function Button({
    className,
    id,
    text,
    icon,
    iconOnly = false,
    onClick = () => {},
    secondary = false,
    disabled = false,
    isLoading = false,
}: {
    className: string | undefined;
    id: string | undefined;
    text: string | undefined;
    icon: React.JSX.Element | undefined;
    iconOnly: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    secondary: boolean;
    disabled: boolean;
    isLoading: boolean;
}) {
    let classes = "button";
    classes += iconOnly ? " icon-button" : "";
    classes += secondary ? " secondary" : " primary";
    classes += isLoading ? " loading" : "";
    classes += className ? ` ${className}` : "";

    return (
        <button
            id={id}
            disabled={disabled || isLoading}
            className={classes}
            onClick={onClick}
        >
            {icon ? cloneElement(icon, { size: 16 }) : null}
            {text && <span>{text}</span>}
        </button>
    );
}

function IconButton({
    className,
    id,
    icon,
    onClick = () => {},
    secondary = false,
    disabled = false,
    isLoading = false,
}: {
    className?: string;
    id?: string;
    icon: React.JSX.Element;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    secondary?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
}) {
    return (
        <Button
            className={className}
            id={id}
            text={undefined}
            icon={icon}
            iconOnly={true}
            onClick={onClick}
            secondary={secondary}
            disabled={disabled}
            isLoading={isLoading}
        />
    );
}

function TextButton({
    className,
    id,
    text,
    icon,
    onClick = () => {},
    secondary = false,
    disabled = false,
    isLoading = false,
}: {
    className?: string;
    id?: string;
    text: string;
    icon?: React.JSX.Element;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    secondary?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
}) {
    return (
        <Button
            className={className}
            id={id}
            text={text}
            icon={icon}
            iconOnly={false}
            onClick={onClick}
            secondary={secondary}
            disabled={disabled}
            isLoading={isLoading}
        />
    );
}

export { TextButton, IconButton };
