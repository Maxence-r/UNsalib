import type { ReactElement } from "react";

import "./Select.css";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function Select<
    O extends {
        id: string;
        name: string;
    }[],
>({
    className,
    id,
    options,
    selected,
    setSelected,
}: {
    className?: string;
    id?: string;
    options: O;
    selected?: O[number]["id"];
    setSelected?: (option: O[number]["id"]) => void;
}): ReactElement {
    return (
        <select
            id={id}
            className={className ? `select ${className}` : "select"}
            value={selected}
            onChange={(e) => setSelected?.(e.target.value)}
            // A terrible hack until React supports the new select API
            dangerouslySetInnerHTML={{
                __html: [
                    "<button><selectedcontent></selectedcontent>",
                    '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></button>',
                    ...options.map(
                        (opt) =>
                            `<option value="${escapeHtml(opt.id)}">${escapeHtml(opt.name)}</option>`,
                    ),
                ].join(""),
            }}
        />
    );
}

export { Select };
