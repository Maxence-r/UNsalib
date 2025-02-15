import { ScriptProps } from "next/script";
import "./button.css";
import { ReactNode } from "react";

export default function Button({ className, children }: { className: string, children: ReactNode }) {
    return (
        <button className={`button ${className}`}>
            <span className="button__text">{ children }</span>
        </button>
    );
}