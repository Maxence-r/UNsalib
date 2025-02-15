import { ScriptProps } from "next/script";
import "./input.css";

export default function Input({ className, type, placeholder }: { className: string, type: string, placeholder: string }) {
    return (
        <input className={`input ${className}`} type={type} placeholder={placeholder} />
    );
}

Input.defaultProps = { className: "", type: "text", placeholder: "" };