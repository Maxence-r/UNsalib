"use client";
import "./auth.css";
import Button from "@/_components/button";
import Input from "@/_components/input";

export default function AuthPanel() {
    return (
        <main tabIndex={-1} className="auth">
            <div id="login-panel">
                <div id="header">
                    <h1>UNsalib</h1>
                    <h2>Authentification</h2>
                </div>
                <div id="error-display"></div>
                <Input id="username" type="text" placeholder="Entrez un nom d'utilisateur"></Input>
                <Input id="password" type="password" placeholder="Entrez un mot de passe"></Input>
                <Button id="submit-button" onClick={() => {}}>Se connecter</Button>
            </div>
        </main>
    )
}