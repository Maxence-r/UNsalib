import { useRef, type MouseEvent as ReactMouseEvent } from "react";

import { Panel } from "./panel/Panel.js";
import { Calendar } from "./calendar/calendar.js";
// import NavigationManager from "../../utils/navigation.js";
import "./App.css";

import { Outlet } from "react-router";
import { useBotChallengeStore } from "../../stores/bot-challenge.store.js";
import { useBotChallenge } from "../../utils/hooks/bot-challenge.hook.js";

function App() {
    useBotChallenge();
    const setHumanCriteriaIfNull = useBotChallengeStore(
        (s) => s.setHumanCriteriaIfNull,
    );
    const antiBotMouseCriteriaDone =
        useBotChallengeStore((s) => s.humanCriteria).mouse !== null;

    const handleMouseMove = (
        e: ReactMouseEvent<HTMLElement, MouseEvent>,
    ): void => {
        if (e.isTrusted && (e.movementX !== 0 || e.movementY !== 0)) {
            setHumanCriteriaIfNull("mouse", true);
        }
    };

    return (
        <main
            id="app"
            onMouseMove={
                !antiBotMouseCriteriaDone ? handleMouseMove : undefined
            }
        >
            {/* <NavigationManager> */}
            <section className="no-compatible">
                <p>
                    Votre écran est orienté dans le mauvais sens ou trop petit.
                </p>
            </section>
            <Panel />
            <div className="main">
                <Outlet />
            </div>
            {/* </NavigationManager> */}
        </main>
    );
}

export { App };
