import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((p) => {
        if (token) p.resolve(token);
        else p.reject(error);
    });
    failedQueue = [];
}

api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const store = useAuthStore.getState();

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            const res = await api.post("/auth/refresh-token");
            const newAccessToken = res.data.accessToken;

            store.setAccessToken(newAccessToken);
            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (err) {
            processQueue(err, null);
            store.logout();
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    },
);

export { api };
