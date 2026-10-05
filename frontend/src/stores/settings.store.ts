import { create } from "zustand";
import { persist } from "zustand/middleware";

type Campuses = "tertre" | "lombarderie";

interface SettingsStore {
    defaultCampus: Campuses;
    setDefaultCampus: (campusId: Campuses) => void;
}

const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            defaultCampus: "lombarderie",

            setDefaultCampus: (campusId: Campuses): unknown =>
                set({ defaultCampus: campusId }),
        }),
        {
            name: "unsalib-settings",
        },
    ),
);

export { useSettingsStore, type Campuses };
