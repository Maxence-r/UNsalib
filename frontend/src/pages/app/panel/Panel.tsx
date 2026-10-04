import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router";

import "./Panel.css";
import { usePanelStore } from "../../../stores/app.store.js";
import { Home } from "./home/Home.js";
import { Settings } from "./settings/Settings.js";

function Panel(): ReactElement {
    const isPanelOpened = usePanelStore((state) => state.isOpened);
    const location = useLocation().pathname;
    const isIndex = location === "/app" || location === "/app/";

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
            {isIndex ? <Home /> : <Settings />}
        </div>
    );
}

export { Panel };
