import "./Badge.css";

function Badge({
    className,
    id,
    text,
}: {
    className?: string;
    id?: string;
    text: string;
}) {
    return (
        <span id={id} className={className ? `badge ${className}` : "badge"}>
            {text}
        </span>
    );
}

export { Badge };
