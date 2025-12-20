import { useState, type KeyboardEvent } from "react";
import { Eye, EyeOff, KeyRound, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router";

import { TextButton, IconButton } from "../../../components/button/Button";
import { Input } from "../../../components/input/Input";
import "./Login.css";
import { login } from "../../../api/auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import { useAccountStore } from "../../../stores/account.store";
import { ResponseError } from "../../../api/axios";

function Login() {
    const [error, setError] = useState<null | string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const setAccessToken = useAuthStore((s) => s.setAccessToken);
    const setAccount = useAccountStore((s) => s.save);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (username.length > 0 && password.length > 0) {
            setIsLoading(true);
            try {
                const loginInfos = await login(username, password);
                setAccessToken(loginInfos.accessToken);
                setAccount(loginInfos.account);
                navigate("/dashboard");
            } catch (e) {
                if (e instanceof ResponseError) {
                    switch (e.message) {
                        case "Network Error":
                            setError("Serveur injoignable");
                            break;
                        case "Invalid credentials":
                            setError(
                                "Nom d'utilisateur ou mot de passe incorrect",
                            );
                            break;
                        case "Internal server error":
                            setError("Erreur interne du serveur");
                            break;
                        default:
                            setError("Erreur inconnue");
                    }
                } else {
                    setError("Erreur inconnue");
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") handleSubmit();
    };

    const handleShowPasswordButtonClick = () => setShowPassword(!showPassword);

    return (
        <div id="login">
            {error && (
                <div className="error">
                    <CircleAlert size={20} />
                    {error}
                </div>
            )}
            <div className="form">
                <div id="username" className="input-container">
                    <Input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        name="username"
                        onInput={(e) =>
                            setUsername((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={handleKeyPress}
                    />
                </div>
                <div id="password" className="input-container">
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe"
                        value={password}
                        name="password"
                        onInput={(e) =>
                            setPassword((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={handleKeyPress}
                    />
                    <IconButton
                        onClick={handleShowPasswordButtonClick}
                        secondary
                        icon={showPassword ? <EyeOff /> : <Eye />}
                    />
                </div>
            </div>
            <div className="actions">
                <TextButton
                    disabled={username.length < 1 || password.length < 1}
                    id="submit-button"
                    onClick={handleSubmit}
                    icon={<KeyRound size={20} />}
                    text="Se connecter"
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

export { Login };
