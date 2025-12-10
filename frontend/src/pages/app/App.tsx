import Panel from "./panel/Panel.js";
import { Calendar } from "./calendar/calendar.js";
import Toast from "../../components/toast/Toast.js";
import NavigationManager from "../../utils/navigation-manager.js";
import "./App.css";

function App() {
    // if (process.env.MAINTENANCE === "true") {
    //     redirect('/maintenance', RedirectType.replace)
    // }

    return (
        <NavigationManager>
            <section className="no-compatible">
                <p>
                    Votre écran est orienté dans le mauvais sens ou trop petit.
                </p>
            </section>
            <Panel />
            <Calendar />
            {/* <Modal /> */}
            <Toast />
        </NavigationManager>
    );
}

export { App };
