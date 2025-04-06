import "./auth.css";
import Form from "./form";

export default function AuthPanel() {
    return (
        <main tabIndex={-1} className="auth">
            <div id="login-panel">
                <div id="header">
                    <h1>UNsalib</h1>
                    <h2>Authentification</h2>
                </div>
                <Form />
            </div>
        </main>
    )
}