import { api } from "./axios";
import type {
    ApiDataLogin,
    ApiDataRefreshToken,
} from "../utils/types/api.type";
import { useAuthStore } from "../stores/auth.store";
import { useAccountStore } from "../stores/account.store";

async function login(username: string, password: string) {
    const res = await api.post("/auth/login", {
        username: username,
        password: password,
    });
    return res.data as ApiDataLogin;
}

async function logout() {
    await api.post("/auth/logout");

    const authStore = useAuthStore.getState();
    const accountStore = useAccountStore.getState();
    authStore.removeAccessToken();
    accountStore.remove();
}

async function refreshToken() {
    const authStore = useAuthStore.getState();
    const accountStore = useAccountStore.getState();
    console.log("ou")

    let newAccessToken: string | null = null;
    try {
        newAccessToken = (
            (await api.get("/auth/refresh-token")).data as ApiDataRefreshToken
        ).accessToken;
        authStore.setAccessToken(newAccessToken);
    } catch {
        authStore.removeAccessToken();
        accountStore.remove();
    }

    return newAccessToken;
}

export { login, logout, refreshToken };
