import { Outlet } from "react-router";
import "./Auth.css";

function Auth() {
    return (
        <div id="login-panel">
            <div className="header">
                <div className="branding">
                    <img src={"/logo96.png"} width={96} height={96} alt="" />
                    <h1>UNsalib</h1>
                </div>
                <h2>Authentification</h2>
            </div>
            <Outlet />
        </div>
    );
}

export { Auth };
