import { useEffect, useState } from "react";

import { useAuthStore } from "../../stores/auth.store";
import { refreshToken } from "../../api/auth.api";

let isRefreshing = false;

function useAuth() {
    const accessToken = useAuthStore<string | null>((s) => s.accessToken);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            if (!accessToken) {
                if (!isRefreshing) {
                    setIsLoading(true);
                    isRefreshing = true;
                    const newToken = await refreshToken();
                    isRefreshing = false;
                    setIsLoggedIn(!!newToken);
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
                setIsLoggedIn(true);
            }
        })();
    }, [accessToken]);

    return { isLoading, isLoggedIn };
}

export { useAuth };
