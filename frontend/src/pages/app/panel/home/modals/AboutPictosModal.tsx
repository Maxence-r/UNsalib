import { Users, Monitor, Eye, Lock } from "lucide-react";
import type { JSX } from "react";

import { TextButton } from "../../../../../components/button/Button";
import "./AboutPictosModal.css";

const PICTOS = [
    { desc: "Salle info/vidéo", icon: <Monitor /> },
    { desc: "Salle de visioconférence", icon: <Eye /> },
    { desc: "Salle en îlots", icon: <Users /> },
    { desc: "Salle à badge", icon: <Lock /> },
];

function AboutPictosModal({ close }: { close?: () => void }): JSX.Element {
    return (
        <div className="about-pictos">
            <div className="pictos">
                {PICTOS.map((picto) => (
                    <div className="option" key={picto.desc}>
                        <p>{picto.desc}</p>
                        {picto.icon}
                    </div>
                ))}
            </div>

            <TextButton onClick={close} text="Compris !" />
        </div>
    );
}

export { AboutPictosModal };
