import { api } from "./axios";

import type {
    ApiDataLogin,
    ApiDataRefreshToken,
} from "../utils/types/api.type";

async function login(username: string, password: string) {
    const res = await api.post("/auth/login", {
        username: username,
        password: password,
    });
    return res.data as ApiDataLogin;
}

async function logout() {
    await api.post("/auth/logout");
}

async function requestNewAccessToken() {
    const res = (await api.get("/auth/refresh-token"))
    return res.data as ApiDataRefreshToken;
}

export { login, logout, requestNewAccessToken };
