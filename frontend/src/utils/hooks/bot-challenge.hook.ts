import { useEffect, useState } from "react";
import { useBotChallengeStore } from "../../stores/bot-challenge.store";
import { sendNotABot } from "../../api/users.api";

function useBotChallenge(): void {
    const humanCriteria = useBotChallengeStore((s) => s.humanCriteria);
    const setHumanCriteriaIfNull = useBotChallengeStore(
        (s) => s.setHumanCriteriaIfNull,
    );
    const notABotSent = useBotChallengeStore((s) => s.notABotSent);
    const setNotABotSent = useBotChallengeStore((s) => s.setNotABotSent);
    const [sendingNotABot, setSendingNotABot] = useState<boolean>(false);

    useEffect(
        () => setHumanCriteriaIfNull("window", typeof window !== "undefined"),
        [humanCriteria.window, setHumanCriteriaIfNull],
    );

    if (
        !sendingNotABot &&
        !notABotSent &&
        humanCriteria.mouse &&
        (humanCriteria.input || humanCriteria.scroll)
    ) {
        setSendingNotABot(true);
        console.log(
            "Anti bot challenge passed! Results:",
            Object.entries(humanCriteria)
                .map(([key, val]) => `${key}=${val}`)
                .join(", "),
        );
        void (async (): Promise<void> => {
            try {
                await sendNotABot();
                setNotABotSent();
            } catch {
                console.error("Cannot set this user as human, will try later");
            }
        })();
    }
}

export { useBotChallenge };
