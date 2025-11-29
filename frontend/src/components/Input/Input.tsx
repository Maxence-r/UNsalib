import "../../utils/theme.css";
import "./Input.css";

export default function Input({ 
    className,
    id,
    type, 
    placeholder,
    value,
    onInput,
    onKeyDown
}: { 
    className: string,
    id: string, 
    type: string,
    placeholder: string,
    value: string,
    onInput: React.KeyboardEventHandler<HTMLInputElement>,
    onKeyDown: React.KeyboardEventHandler<HTMLInputElement>
}) {
    return (
        <input 
        id={id} 
        className={`input ${className}`} 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onInput={onInput}
        onKeyDown={onKeyDown}
        />
    );
}

Input.defaultProps = { 
    className: "", 
    id: "", 
    type: "text", 
    placeholder: "", 
    value: "", 
    onInput: (() => { }), 
    onKeyDown: (() => { }) 
};