import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Account {
    id: string;
    username: string;
    name: string;
    lastname: string;
}

interface AccountStore {
    account: Account | null;
    save: (account: Account) => void;
    remove: () => void;
}

const useAccountStore = create<AccountStore>()(
    persist(
        (set) => ({
            account: null,

            save: (account: Account): unknown => set({ account: account }),
            remove: (): unknown => set({ account: null }),
        }),
        {
            name: "unsalib-account",
        },
    ),
);

export { useAccountStore, type Account };
