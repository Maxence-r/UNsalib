import { Panel } from "./panel/Panel.js";
import { Calendar } from "./calendar/calendar.js";
// import NavigationManager from "../../utils/navigation.js";
import "./App.css";

import { Outlet } from "react-router";

function App() {
    // if (process.env.MAINTENANCE === "true") {
    //     redirect('/maintenance', RedirectType.replace)
    // }

    return (
        <main id="app">
            {/* <NavigationManager> */}
            <section className="no-compatible">
                <p>
                    Votre écran est orienté dans le mauvais sens ou trop petit.
                </p>
            </section>
            <Panel />
            {/* <Outlet /> */}
            <Calendar />
            {/* </NavigationManager> */}
        </main>
    );
}

export { App };
