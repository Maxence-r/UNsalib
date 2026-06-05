import { Wrench } from "lucide-react";

export default function App() {
    return (
        <main tabIndex={-1} className="status-page">
            <section className="status-content">
                <Wrench className="status-icon" size={40} strokeWidth={1.8} />
                <h1>Maintenance</h1>
                <p>UNsalib revient dans quelques instants.</p>
                <span>Merci pour votre patience.</span>
            </section>
        </main>
    );
}
