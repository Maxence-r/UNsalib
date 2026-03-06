import type { JSX } from "react";
import { Outlet } from "react-router";

import "./Panel.css";
import { usePanelStore } from "../../../stores/app.store.js";

function Panel(): JSX.Element {
    const isPanelOpened = usePanelStore((state) => state.isOpened);

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
            <Outlet />
        </div>
    );
}

export { Panel };
