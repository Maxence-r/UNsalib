import "../../utils/theme.css";
import "./Input.css";

function Input({
    className,
    id,
    type = "text",
    placeholder = "",
    value = "",
    name = null,
    onInput = () => {},
    onKeyDown = () => {},
}: {
    className?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    name?: string | null;
    onInput?: React.KeyboardEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
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
