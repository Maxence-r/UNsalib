import { Flame } from "lucide-react";
import { redirect, RedirectType } from 'next/navigation';

export default function App() {
    if (process.env.MAINTENANCE === "false") {
        redirect("/", RedirectType.replace);
    }

    return (
        <div className="page">
            <Flame className="icon" size={96} />
            <div
                className="infos"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 24,
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <h1>Maintenance</h1>
                <div>
                    Nous faisons notre maximum pour rétablir UNsalib au plus
                    vite.
                </div>
                <div
                    style={{
                        fontSize: 14,
                        marginTop: "30%",
                        color: "var(--neutral-color-dark)",
                    }}
                >
                    Vous pouvez prendre une petite pause en attendant ! 😉
                </div>
            </div>
        </div>
    );
}
