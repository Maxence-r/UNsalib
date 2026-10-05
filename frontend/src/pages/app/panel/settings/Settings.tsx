import { useState, type ReactElement } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import "./Settings.css";
import { IconButton, TextButton } from "../../../../components/button/Button";
import { Switch } from "../../../../components/switch/Switch";

function Settings(): ReactElement {
    const [isSwitchChecked, setIsSwitchChecked] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleBackButton = (): void => {
        const state = location.state;

        if (state?.fromInsideApp) {
            navigate(-1);
            return;
        }

        navigate("/app", { viewTransition: true });
    };

    return (
        <div className="settings">
            <div className="header">
                <IconButton
                    onClick={handleBackButton}
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
