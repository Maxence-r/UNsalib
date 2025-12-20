import { useState } from "react";
import { Eye, EyeOff, KeyRound, CircleAlert } from "lucide-react";

import { TextButton, IconButton } from "../../../components/button/Button";
import { Input } from "../../../components/input/Input";

function Login() {
    const [displayError, setDisplayError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const login = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.NEXT_PUBLIC_API_URL}/auth/login`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                },
            );
            const loginState = await response.json();
            if (loginState.error) {
                if (loginState.error == "BAD_CREDENTIALS") {
                    throw new Error(
                        "Nom d'utilisateur ou mot de passe incorrect",
                    );
                } else if (loginState.error == "INTERNAL_ERROR") {
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
            {displayError != "" ? (
                <div id="error-display">
                    <CircleAlert size={20} />
                    {displayError}
                </div>
            ) : (
                <></>
            )}
            <div className="inputs-group">
                <div id="username" className="input-container">
                    <Input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onInput={(e) =>
                            setUsername((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                username.length > 0 &&
                                password.length > 0
                            )
                                login();
                        }}
                    />
                </div>
                <div id="password" className="input-container">
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe"
                        value={password}
                        onInput={(e) =>
                            setPassword((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                username.length > 0 &&
                                password.length > 0
                            )
                                login();
                        }}
                    />
                    <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        secondary
                        icon={
                            showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )
                        }
                    />
                </div>
            </div>
            <div className="actions">
                <TextButton
                    disabled={username.length < 1 || password.length < 1}
                    id="submit-button"
                    onClick={login}
                    icon={<KeyRound size={20} />}
                    text="Se connecter"
                />
            </div>
        </>
    );
}

export { Login };
