import { create } from "zustand";

interface AuthStore {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    removeAccessToken: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,

    setAccessToken: (token) => set({ accessToken: token }),
    removeAccessToken: () => set({ accessToken: null }),
}));

export { useAuthStore };
