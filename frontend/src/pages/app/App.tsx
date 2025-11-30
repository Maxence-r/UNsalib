import Panel from "./panel/panel.js";
import Calendar from "./calendar/calendar.js";
import Modal from "../../components/modal/Modal.js";
import Toast from "../../components/toast/Toast.js";
import type { ApiRoomsList } from "../../utils/api-types.js";
import NavigationManager from "../../utils/navigation-manager.js";
import "./App.css";
import { getRoomsList } from "../../utils/server-actions.js";
import { useEffect, useState } from "react";

function App() {
    // if (process.env.MAINTENANCE === "true") {
    //     redirect('/maintenance', RedirectType.replace)
    // }

    // QUICK PATCH
    const [roomsList, setRoomsList] = useState<ApiRoomsList>({
        success: false,
        data: [],
    });

    useEffect(() => {
        const fetch = async () => {
            setRoomsList(await getRoomsList("", ""));
        };
        fetch();
    }, []);
    // QUICK PATCH

    return (
        <NavigationManager>
            <main tabIndex={-1} className="main">
                <section className="no-compatible">
                    <p>
                        Votre écran est orienté dans le mauvais sens ou trop
                        petit.
                    </p>
                </section>
                <Panel roomsList={roomsList} />
                <Calendar />
                <Modal />
                <Toast />
            </main>
        </NavigationManager>
    );
}

export { App };
