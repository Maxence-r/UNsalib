import { useEffect } from "react";

import { useAuthStore } from "../../stores/auth.store";
import { refreshToken } from "../../api/axios";

function useAuthInit() {
    useEffect(() => {
        (async () => {
            if (!useAuthStore.getState().accessToken) {
                await refreshToken();
            }
        })();
    }, []);
}

export { useAuthInit };
