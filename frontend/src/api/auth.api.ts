import { api } from "./axios";
import type {
    ApiDataLogin,
} from "../utils/types/api.type";
import { useAuthStore } from "../stores/auth.store";
import { useAccountStore } from "../stores/account.store";

async function login(
    username: string,
    password: string,
): Promise<ApiDataLogin> {
    const res = await api.post("/auth/login", {
        username: username,
        password: password,
    });
    return res.data as ApiDataLogin;
}

async function logout(): Promise<void> {
    await api.post("/auth/logout");

    const authStore = useAuthStore.getState();
    const accountStore = useAccountStore.getState();
    authStore.removeAccessToken();
    accountStore.remove();
}

export { login, logout };
