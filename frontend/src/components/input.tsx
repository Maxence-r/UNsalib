import "./input.css";

export default function Input({ className, type, placeholder, onInput }: { className: string, type: string, placeholder: string, onInput: React.KeyboardEventHandler<HTMLInputElement> }) {
    return (
        <input className={`input ${className}`} type={type} placeholder={placeholder} onInput={onInput} />
    );
}

Input.defaultProps = { className: "", type: "text", placeholder: "", onInput: (() => { }) };