import { CircleAlert } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router";

import "./Logout.css";
import { logout } from "../../../api/auth.api";
import { useAuth } from "../../../utils/hooks/auth.hook";

function Logout(): ReactElement {
    const navigate = useNavigate();
    const { isLoading, isLoggedIn } = useAuth();
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!isLoading) {
            (async (): Promise<void> => {
                if (isLoggedIn) {
                    try {
                        await logout();
                        navigate("/auth/login");
                    } catch {
                        setError(true);
                    }
                } else {
                    navigate("/auth/login");
                }
            })();
        }
    }, [isLoggedIn, isLoading, navigate]);

    return (
        <div id="logout">
            <h2>Déconnexion</h2>
            {error && (
                <div className="error">
                    <CircleAlert size={20} />
                    Impossible de finaliser l'opération : vous êtes peut-être
                    toujours connecté·e !
                </div>
            )}
            {isLoading && <div className="loader" />}
        </div>
    );
}

export { Logout };
