import { EllipsisVertical, MapPin } from "lucide-react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";

import "./Header.css";
import { IconButton } from "../../../../../components/button/Button.js";
import CampusBannerUrl from "../../../../../assets/imgs/campuses/lombarderie.jpg";
import { InstallButton } from "./InstallButton.js";
import { useModal } from "../../../../../components/modal/Modal.js";
import { CampusModal } from "../modals/CampusModal.js";

function Header(): ReactElement {
    const { open: openCampusModal } = useModal("campus", <CampusModal />);
    const navigate = useNavigate();

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
                <img className="banner" src={CampusBannerUrl} alt="" />

                <div className="overlay" />
                <div className="legend">Sciences et techniques</div>
            </div>
        </header>
    );
}

export { Header };
