import { Outlet } from "react-router";
import "./Auth.css";

function Auth() {
    return (
        <main id="auth">
            <div className="panel">
                <div className="branding">
                    <img src={"/logo96.png"} alt="" />
                    <h1>UNsalib</h1>
                </div>
                <Outlet />
            </div>
        </main>
    );
}

export { Auth };
