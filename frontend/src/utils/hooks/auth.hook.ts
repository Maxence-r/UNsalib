import { useEffect, useState } from "react";

import { useAuthStore } from "../../stores/auth.store";
import { refreshToken } from "../../api/axios";
import { useAccountStore, type Account } from "../../stores/account.store";

let isRefreshing = false;

function useAuth(): {
    isLoading: boolean;
    isLoggedIn: boolean;
} {
    const accessToken = useAuthStore<string | null>((s) => s.accessToken);
    const account = useAccountStore<Account | null>((s) => s.account);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        (async (): Promise<void> => {
            if (account) {
                if (accessToken) {
                    setIsLoading(false);
                    setIsLoggedIn(true);
                } else {
                    if (isRefreshing) return;

                    setIsLoading(true);
                    isRefreshing = true;
                    const newToken = await refreshToken();
                    isRefreshing = false;
                    setIsLoggedIn(!!newToken);
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        })();
    }, [accessToken, account]);

    return { isLoading, isLoggedIn };
}

export { useAuth };
