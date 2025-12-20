import { useEffect } from "react";
import { api } from "../../api/axios";
import { useAuthStore } from "../../stores/auth.store";

function useAuthInit() {
    const setAccessToken = useAuthStore((s) => s.setAccessToken);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.post("/auth/refresh-token");
                setAccessToken(res.data.accessToken);
            } catch {
                setAccessToken(null);
            }
        })();
    }, [setAccessToken]);
}

export { useAuthInit };
