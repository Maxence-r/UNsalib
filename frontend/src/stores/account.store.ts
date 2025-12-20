import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Account {
    id: string | null;
    username: string | null;
    name: string | null;
    lastname: string | null;
}

interface AccountStore extends Account {
    save: (account: Account) => void;
    remove: () => void;
}

const useAccountStore = create<AccountStore>()(
    persist(
        (set) => ({
            id: null,
            username: null,
            name: null,
            lastname: null,

            save: (account: Account) => {
                set({ id: account.id });
                set({ username: account.username });
                set({ name: account.name });
                set({ lastname: account.lastname });
            },
            remove: () => {
                set({ id: null });
                set({ username: null });
                set({ name: null });
                set({ lastname: null });
            },
        }),
        {
            name: "unsalib-account",
        },
    ),
);

export { useAccountStore };
