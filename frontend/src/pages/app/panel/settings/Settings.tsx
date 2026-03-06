import "./Settings.css"
import { Link } from "react-router";

function Settings() {
    return (
        <div style={{ viewTransitionName: "panel-settings" }}>
            Settings
            <Link to="/" viewTransition>
                Home
            </Link>
        </div>
    );
}

export { Settings };
