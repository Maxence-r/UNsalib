"use client";

import { useEffect, useState } from "react";

import Button from "@/_components/button";
import Input from "@/_components/input";

export default function Form() {
    const [displayError, setDisplayError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    })
                }
            );
            const loginState = await response.json();
            if (loginState.error) {
                if (loginState.error == "BAD_CREDENTIALS") {
                    throw new Error("Nom d'utilisateur ou mot de passe incorrect");
                } else if (loginState.error == 'INTERNAL_ERROR') {
                    throw new Error("Erreur interne du serveur");
                }
                throw new Error();
            } 
            window.location.href = "/admin/dashboard";
        } catch (e) {
            if (e instanceof Error) {
                setDisplayError(e.toString().replace("Error: ", ""));
            } else {
                setDisplayError("Erreur inconnue");
            }
        }
    };

    return (
        <>
            {displayError != "" ? <div id="error-display">{displayError}</div> : <></>}
            <Input id="username" type="text" placeholder="Entrez un nom d'utilisateur" value={username} onInput={(e) => setUsername((e.target as HTMLInputElement).value)} />
            <Input id="password" type="password" placeholder="Entrez un mot de passe" value={password} onInput={(e) => setPassword((e.target as HTMLInputElement).value)} />
            <Button id="submit-button" onClick={login}>Se connecter</Button>
        </>
    )
}