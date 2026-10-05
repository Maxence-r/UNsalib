import { EllipsisVertical, MapPin } from "lucide-react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";

import "./Header.css";
import { IconButton } from "../../../../../components/button/Button.js";
import { InstallButton } from "./InstallButton.js";
import { useModal } from "../../../../../components/modal/Modal.js";
import { CampusModal } from "../modals/CampusModal.js";
import { useSettingsStore } from "../../../../../stores/settings.store.js";
import { CAMPUSES } from "../../../../../utils/constants.js";

function Header(): ReactElement {
    const { open: openCampusModal } = useModal("campus", <CampusModal />);
    const navigate = useNavigate();
    const defaultCampus = useSettingsStore((s) => s.defaultCampus);
    const defaultCampusInfos = CAMPUSES.find((c) => c.id === defaultCampus);

    return (
        <header className="header">
            <div className="top-bar">
                <div className="branding">
                    <img src="/logo96.png" alt="UNsalib logo" />
                    <h1>UNsalib</h1>
                </div>
                <div className="actions">
                    <InstallButton />
                    <IconButton
                        onClick={openCampusModal}
                        icon={<MapPin />}
                        secondary
                    />
                    <IconButton
                        onClick={() =>
                            navigate("/app/settings", {
                                viewTransition: true,
                                state: { fromInsideApp: true },
                            })
                        }
                        icon={<EllipsisVertical />}
                        secondary
                    />
                </div>
            </div>
            <div className="campus">
                <img
                    className="banner"
                    src={defaultCampusInfos?.bannerUrl}
                    alt=""
                />

                <div className="overlay" />
                <div className="legend">{defaultCampusInfos?.name}</div>
            </div>
        </header>
    );
}

export { Header };
