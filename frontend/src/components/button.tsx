import { ScriptProps } from "next/script";
import "./button.css";

export default function Button(props: ScriptProps) {
    return (
        <button className="button">
            <span className="button__text">{ props.children }</span>
        </button>
    );
}