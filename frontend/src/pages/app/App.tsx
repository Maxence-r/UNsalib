import Panel from "./panel/panel.js";
import Calendar from "./calendar/calendar.js";
import Modal from "../../components/modal/Modal.js";
import Toast from "../../components/toast/Toast.js";
import type { ApiRoomsList } from "../../utils/api-types.js";
import NavigationManager from "../../utils/navigation-manager.js";
import "./App.css";
// import { redirect, RedirectType } from 'next/navigation'

function App() {
    // if (process.env.MAINTENANCE === "true") {
    //     redirect('/maintenance', RedirectType.replace)
    // }
    const prefetchedRoomsList: ApiRoomsList = { success: false, data: [] };
    return (
        <NavigationManager>
            <main tabIndex={-1} className="main">
                <section className="no-compatible">
                    <p>
                        Votre écran est orienté dans le mauvais sens ou trop
                        petit.
                    </p>
                </section>
                <Panel roomsList={prefetchedRoomsList} />
                <Calendar />
                <Modal />
                <Toast />
            </main>
        </NavigationManager>
    );
}

export { App };
