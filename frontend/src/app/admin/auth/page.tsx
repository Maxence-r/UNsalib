import Image from "next/image";

import "./auth.css";
import Form from "./form";

export default function AuthPanel() {
    return (
        <main tabIndex={-1} className="auth">
            <div id="login-panel">
                <div className="header">
                    <div className="branding">
                        <Image src={"/logo96.png"} width={96} height={96} alt="" />
                        <h1>UNsalib</h1>
                    </div>
                    <h2>Authentification</h2>
                </div>
                <Form />
            </div>
        </main>
    )
}