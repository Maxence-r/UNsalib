import { create } from "zustand";

interface AuthStore {
    accessToken: string | null;
    setAccessToken: (token: string) => void;
    removeAccessToken: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,

    setAccessToken: (token): void => set({ accessToken: token }),
    removeAccessToken: (): void => set({ accessToken: null }),
}));

export { useAuthStore };
