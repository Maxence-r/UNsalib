import Panel from './panel';
import Calendar from './calendar';
import ContextProvider from "./contextProvider";

export default function Home() {
    return (
        <ContextProvider>
            <section className="no-compatible">
                <p>Votre écran est orienté dans le mauvais sens ou trop petit.</p>
            </section>
            <section className="loader">
                <div className="progress">
                    <img src="/loader.svg" />
                </div>
            </section>
            <Panel></Panel>
            <Calendar></Calendar>
            <div className="notif">
                <p>Attention vous avez dépassé</p>
            </div>
        </ContextProvider>
    );
}