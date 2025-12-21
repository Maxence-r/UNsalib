import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import "./Logout.css";
import { logout } from "../../../api/auth.api";
import { useAuth } from "../../../utils/hooks/auth.hook";
import { router } from "../../Router";

function Logout() {
    const { isLoading, isLoggedIn } = useAuth();
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!isLoading) {
            (async () => {
                if (isLoggedIn) {
                    try {
                        await logout();
                        router.navigate("/auth/login");
                    } catch {
                        setError(true);
                    }
                } else {
                    router.navigate("/auth/login");
                }
            })();
        }
    }, [isLoggedIn, isLoading]);

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
