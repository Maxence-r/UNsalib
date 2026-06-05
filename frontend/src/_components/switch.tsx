import { useState } from "react";

import "@/_utils/theme.css";
import "./switch.css";

export function Switch({
    className = "",
    id = "",
    checked,
    disabled,
    onChange,
    onCheck,
    onUncheck
}: {
    className?: string,
    id?: string,
    checked?: boolean,
    disabled?: boolean,
    onChange?: (checked: boolean) => void,
    onCheck?: () => void,
    onUncheck?: () => void
}) {
    const [internalChecked, setInternalChecked] = useState(false);
    const isChecked = checked ?? internalChecked;

    const checkHandler = () => {
        const nextChecked = !isChecked;
        if (nextChecked) {
            onCheck?.();
        } else {
            onUncheck?.();
        }
        onChange?.(nextChecked);
        if (checked === undefined) {
            setInternalChecked(nextChecked);
        }
    };

    return (
        <label className={`switch ${className}`} id={id}>
            <input className="switch-input" type="checkbox" checked={isChecked} disabled={disabled} onChange={checkHandler} />
            <span className="switch-slider"></span>
        </label>
    );
}

export function SwitchView({
    title,
    description,
    className = "",
    id = "",
    checked,
    disabled,
    onChange,
    onCheck,
    onUncheck
}: {
    title?: string,
    description?: string,
    className?: string,
    id?: string,
    checked?: boolean,
    disabled?: boolean,
    onChange?: (checked: boolean) => void,
    onCheck?: () => void,
    onUncheck?: () => void
}) {
    return (
        <div className={`switch-view ${className}`} id={id}>
            <div className="switch-view-text">
                <span className="switch-view-title">{title}</span>
                {description ? <span className="switch-view-desc">{description}</span> : <></>}
            </div>
            <Switch checked={checked} disabled={disabled} onChange={onChange} onCheck={onCheck} onUncheck={onUncheck}></Switch>
        </div>
    );
}
