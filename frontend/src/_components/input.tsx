import "./input.css";
import "@/_utils/theme.css";

export default function Input({ className, type, placeholder, onInput, id }: { className: string, type: string, placeholder: string, onInput: React.KeyboardEventHandler<HTMLInputElement>, id: string }) {
    return (
        <input id={id} className={`input ${className}`} type={type} placeholder={placeholder} onInput={onInput} />
    );
}

Input.defaultProps = { className: "", type: "text", placeholder: "", onInput: (() => { }), id: "" };