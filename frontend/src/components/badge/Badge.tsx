import type { ReactElement } from "react";

import "./Badge.css";

function Badge({
    className,
    id,
    text,
    accent,
}: {
    className?: string;
    id?: string;
    text: string;
    accent?: boolean;
}): ReactElement {
    return (
        <span
            id={id}
            className={`badge${accent ? " accent" : ""}${className ? ` ${className}` : ""}`}
        >
            {text}
        </span>
    );
}

export { Badge };
