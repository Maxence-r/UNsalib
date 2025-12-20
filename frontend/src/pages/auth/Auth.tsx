import { Outlet } from "react-router";
import "./Auth.css";

function Auth() {
    return (
        <main id="auth">
            <div className="panel">
                <header>
                    <div className="branding">
                        <img
                            src={"/logo96.png"}
                            width={96}
                            height={96}
                            alt=""
                        />
                        <h1>UNsalib</h1>
                    </div>
                    <h2>Connexion</h2>
                </header>
                <Outlet />
            </div>
        </main>
    );
}

export { Auth };
