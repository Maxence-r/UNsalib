import "./input.css";
import "@/_utils/theme.css";

export default function Input({ 
    className,
    id,
    type, 
    placeholder,
    value,
    onInput
}: { 
    className: string,
    id: string, 
    type: string,
    placeholder: string,
    value: string,
    onInput: React.KeyboardEventHandler<HTMLInputElement> 
}) {
    return (
        <input id={id} className={`input ${className}`} type={type} placeholder={placeholder} value={value} onInput={onInput} />
    );
}

Input.defaultProps = { className: "", id: "", type: "text", placeholder: "", value: "", onInput: (() => { }) };