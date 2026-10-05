import type { ReactElement } from "react";
import { useLocation, useSearchParams } from "react-router";

import "./Panel.css";
import { Home } from "./home/Home.js";
import { Settings } from "./settings/Settings.js";

function Panel(): ReactElement {
    const [searchParams] = useSearchParams();
    const location = useLocation().pathname;
    const isPanelHidden = searchParams.get("panel") === "hidden";
    const isSettings = location.startsWith("/app/settings");

    return (
        <div tabIndex={-1} className={`panel${isPanelHidden ? " hidden" : ""}`}>
            {isSettings ? <Settings /> : <Home />}
        </div>
    );
}

export { Panel };
