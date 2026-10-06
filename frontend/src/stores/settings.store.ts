import { create } from "zustand";
import { persist } from "zustand/middleware";

type Campuses = "tertre" | "lombarderie";

interface SettingsStore {
    defaultCampus: Campuses;
    useAccessibleColors: boolean;
    setDefaultCampus: (campusId: Campuses) => void;
    setUseAccessibleColors: (val: boolean) => void;
}

const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            defaultCampus: "lombarderie",
            useAccessibleColors: false,

            setDefaultCampus: (campusId): unknown =>
                set({ defaultCampus: campusId }),
            setUseAccessibleColors: (val): unknown =>
                set({ useAccessibleColors: val }),
        }),
        {
            name: "unsalib-settings",
        },
    ),
);

export { useSettingsStore, type Campuses };
