import axios, { AxiosError } from "axios";

import { useAuthStore } from "../stores/auth.store";
import type { Api, ApiError, ApiSuccess } from "../utils/types/api.type";
import { requestNewAccessToken } from "./auth.api";
import { useAccountStore } from "../stores/account.store";

class ResponseError extends Error {
    constructor(message: string) {
        super(message);
    }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((p) => {
        if (token) p.resolve(token);
        else p.reject(error);
    });
    failedQueue = [];
}

async function refreshToken(errorCallback?: (error: unknown) => void) {
    const authStore = useAuthStore.getState();
    const accountStore = useAccountStore.getState();

    try {
        const newAccessToken = (await requestNewAccessToken()).accessToken;
        authStore.setAccessToken(newAccessToken);
        return newAccessToken;
    } catch (e) {
        authStore.removeAccessToken();
        accountStore.remove();
        if (errorCallback) errorCallback(e);
        window.location.href = "/auth/login";
    }
}

api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        const responseData = response.data as Api;
        if (!responseData.success) {
            throw new AxiosError(
                undefined,
                undefined,
                response.config,
                response.request,
                response,
            );
        }
        response.data = (responseData as ApiSuccess).data;
        return response;
    },
    async (error: AxiosError & { _retry?: boolean }) => {
        const originalRequest = error.config;
        if (!originalRequest) throw new ResponseError("Unexpected error");

        if (
            error.response?.status !== 401 ||
            error._retry ||
            originalRequest.url?.includes("login") ||
            originalRequest.url?.includes("refresh-token")
        ) {
            return Promise.reject(
                new ResponseError(
                    error.response
                        ? (error.response.data as ApiError).message
                        : error.message,
                ),
            );
        }

        error._retry = true;

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

        const newAccessToken = await refreshToken((error) => {
            const responseError = new ResponseError((error as Error).message);
            processQueue(responseError, null);
            Promise.reject(responseError);
            isRefreshing = false;
        });

        if (newAccessToken) {
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            isRefreshing = false;
            return api(originalRequest);
        }
    },
);

export { api, refreshToken, ResponseError };
