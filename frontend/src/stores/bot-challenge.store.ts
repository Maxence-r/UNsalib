import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HumanCriteria {
    mouse: boolean | null;
    scroll: boolean | null;
    input: boolean | null;
    window: boolean | null;
}

interface BotChallengeStore {
    humanCriteria: HumanCriteria;
    setHumanCriteriaIfNull: (
        criteria: keyof HumanCriteria,
        val: boolean,
    ) => void;
    notABotSent: boolean;
    setNotABotSent: () => void;
}

const useBotChallengeStore = create<BotChallengeStore>()(
    persist(
        (set) => ({
            humanCriteria: {
                mouse: null,
                scroll: null,
                input: null,
                window: null,
            },
            notABotSent: false,

            setHumanCriteriaIfNull: (criteria, val): unknown =>
                set((s) => {
                    if (s.humanCriteria[criteria] !== null) return s;
                    return {
                        humanCriteria: {
                            ...s.humanCriteria,
                            [criteria]: val,
                        },
                    };
                }),
            setNotABotSent: (): unknown => set({ notABotSent: true }),
        }),
        {
            name: "unsalib-bot-challenge",
        },
    ),
);

export { useBotChallengeStore };
