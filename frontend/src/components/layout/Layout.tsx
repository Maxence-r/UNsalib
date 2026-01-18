import type { ReactNode } from "react";

import "./Layout.css";

function Section({
    title,
    children,
}: {
    title?: string;
    children: ReactNode;
}): React.JSX.Element {
    return (
        <div className="section">
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
}): React.JSX.Element {
    return (
        <div className="layout">
            {title && <h3 className="title">{title}</h3>}
            {children}
        </div>
    );
}

export { Layout, Section };
