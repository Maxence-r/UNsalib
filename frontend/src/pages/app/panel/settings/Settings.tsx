import "./Settings.css"
import { Link } from "react-router";

function Settings() {
    return (
        <div className="settings">
            Settings
            <Link to="/" viewTransition>
                Home
            </Link>
        </div>
    );
}

export { Settings };
