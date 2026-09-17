import type { ReactNode, ReactElement } from "react";

import "./Layout.css";

function Section({
    title,
    children,
    className,
    id,
}: {
    title?: string;
    children: ReactNode;
    className?: string;
    id?: string;
}): ReactElement {
    return (
        <div className={`section${className ? " " + className : ""}`} id={id}>
            {title && <h3 className="title">{title}</h3>}
            {children}
        </div>
    );
}

function Layout({
    title,
    children,
}: {
    title?: string;
    children: ReactNode;
}): ReactElement {
    return (
        <div className="layout">
            {title && <h3 className="title">{title}</h3>}
            {children}
        </div>
    );
}

export { Layout, Section };
