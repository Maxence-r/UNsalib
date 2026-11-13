import { ApiPost } from "./axios";
import type { ApiDataLogin } from "../utils/types/api.type";
import { useAuthStore } from "../stores/auth.store";
import { useAccountStore } from "../stores/account.store";

class Login extends ApiPost<ApiDataLogin> {
    constructor(username: string, password: string) {
        super("/auth/login", {
            username,
            password,
        });
    }
}

class Logout extends ApiPost<void> {
    constructor() {
        super("/auth/logout");
        this.setAfterHook(this.refreshStores);
    }

    private refreshStores(): void {
        const authStore = useAuthStore.getState();
        const accountStore = useAccountStore.getState();
        authStore.removeAccessToken();
        accountStore.remove();
    }
}

export { Login, Logout };
