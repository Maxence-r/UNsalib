import "../../utils/theme.css";
import "./Input.css";

function Input({
    className = "",
    id = "",
    type = "text",
    placeholder = "",
    value = "",
    onInput = () => {},
    onKeyDown = () => {},
}: {
    className?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onInput?: React.KeyboardEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
    return (
        <input
            id={id}
            className={className ? `input ${className}` : "input"}
            type={type}
            placeholder={placeholder}
            value={value}
            onInput={onInput}
            onKeyDown={onKeyDown}
        />
    );
}

export { Input };
