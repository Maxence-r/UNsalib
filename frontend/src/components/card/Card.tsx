import type { ReactNode } from "react";

import "../../utils/theme.css";
import "./Card.css";

export function CardHeader({ children }: { children: string }) {
    return (
        <div className="card-header">
            <h3>{children}</h3>
        </div>
    )
}

export function CardContent({ children }: { children: ReactNode }) {
    return (
        <div className="card-content">
            {children}
        </div>
    )
}

export function CardActions({ children }: { children: ReactNode }) {
    return (
        <div className="card-actions">
            {children}
        </div>
    )
}

export function Card({
    className,
    children,
    id,
    highlighted,
    elevated,
    isLoading
}: {
    className: string,
    children: ReactNode,
    id: string,
    highlighted: boolean,
    elevated: boolean,
    isLoading: boolean
}) {
    return (
        <div className={`card${highlighted ? " highlighted" : ""}${elevated ? " elevated" : ""} ${className}`} id={id}>
            {children}
            {isLoading && <div className="loader"></div>}
        </div>
    );
}

Card.defaultProps = { className: "", id: "", highlighted: false, elevated: false, isLoading: false };