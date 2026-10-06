import { type ReactElement } from "react";
import { ArrowLeft, Info, MessageSquare } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import "./Settings.css";
import { IconButton, TextButton } from "../../../../components/button/Button";
import { Switch } from "../../../../components/switch/Switch";
import { useDeviceType } from "../../../../utils/hooks/device.hook";
import { useSettingsStore } from "../../../../stores/settings.store";

function Settings(): ReactElement {
    const navigate = useNavigate();
    const [_searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const isMobile = useDeviceType() === "mobile";
    const useAccessibleColors = useSettingsStore((s) => s.useAccessibleColors);
    const setUseAccessibleColors = useSettingsStore(
        (s) => s.setUseAccessibleColors,
    );

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
                {isMobile && (
                    <IconButton
                        onClick={() => setSearchParams("?panel=hidden")}
                        icon={<Info />}
                        secondary
                    />
                )}
            </div>
            <div className="options">
                <div className="switch-container">
                    <div className="desc">
                        <h4>Contrastes élevés</h4>
                        <span>
                            Utiliser le maximum de contraste pour l'affichage
                            des cours dans le calendrier.
                        </span>
                    </div>
                    <Switch
                        isChecked={useAccessibleColors}
                        setIsChecked={setUseAccessibleColors}
                    />
                </div>
            </div>
            <TextButton text="Laisser un avis" icon={<MessageSquare />} />
        </div>
    );
}

export { Settings };
