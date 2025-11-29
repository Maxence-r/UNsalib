import { useState } from "react";

import "../../utils/theme.css";
import "./Switch.css";

export function Switch({
    className,
    id,
    onCheck,
    onUncheck
}: {
    className: string,
    id: string,
    onCheck: () => void,
    onUncheck: () => void
}) {
    const [isChecked, setIsChecked] = useState(false)

    const checkHandler = () => {
        if (!isChecked) {
            onCheck();
        } else {
            onUncheck();
        }
        setIsChecked(!isChecked);
    };

    return (
        <label className={`switch ${className}`} id={id}>
            <input className="switch-input" type="checkbox" checked={isChecked} onChange={checkHandler} />
            <span className="switch-slider"></span>
        </label>
    );
}

export function SwitchView({
    title,
    description,
    className,
    id,
    onCheck,
    onUncheck
}: {
    title: string,
    description: string,
    className: string,
    id: string,
    onCheck: () => void,
    onUncheck: () => void
}) {
    return (
        <div className={`switch-view ${className}`} id={id}>
            <div className="switch-view-text">
                <span className="switch-view-title">{title}</span>
                {description ? <span className="switch-view-desc">{description}</span> : <></>}
            </div>
            <Switch onCheck={onCheck} onUncheck={onUncheck}></Switch>
        </div>
    );
}

Switch.defaultProps = { className: "", id: "", onCheck: () => { }, onUncheck: () => { } };
SwitchView.defaultProps = { title: "", description: "", className: "", id: "", onCheck: () => { }, onUncheck: () => { } };