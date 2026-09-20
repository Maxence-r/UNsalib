import type { InputEventHandler, KeyboardEventHandler, ReactElement } from "react";

import "./Input.css";

function Input({
    className,
    id,
    type = "text",
    placeholder = "",
    value = "",
    name,
    onInput,
    onKeyDown,
}: {
    className?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    name?: string;
    onInput?: InputEventHandler<HTMLInputElement>;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}): ReactElement {
    return (
        <input
            id={id}
            className={className ? `input ${className}` : "input"}
            type={type}
            placeholder={placeholder}
            name={name ?? placeholder}
            value={value}
            onInput={onInput}
            onKeyDown={onKeyDown}
        />
    );
}

export { Input };
