import { useState, type ReactElement } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";

import "./Settings.css";
import { IconButton, TextButton } from "../../../../components/button/Button";
import { router } from "../../../Router";
import { Switch } from "../../../../components/switch/Switch";

function Settings(): ReactElement {
    const [isSwitchChecked, setIsSwitchChecked] = useState<boolean>(false);

    return (
        <div className="settings">
            <div className="header">
                <IconButton
                    onClick={() =>
                        router.navigate("/app", {
                            viewTransition: true,
                        })
                    }
                    icon={<ArrowLeft />}
                    secondary
                />
                <h1>Paramètres</h1>
            </div>
            <div className="options">
                <div className="switch-container">
                    <div className="desc">
                        <h4>Contrastes élevés</h4>
                        <span>
                            Utiliser des couleurs plus contrastées pour
                            l'affichage des cours dans le calendrier.
                        </span>
                    </div>
                    <Switch
                        isChecked={isSwitchChecked}
                        setIsChecked={setIsSwitchChecked}
                    />
                </div>
            </div>
            <TextButton text="Laisser un avis" icon={<MessageSquare />} />
        </div>
    );
}

export { Settings };
