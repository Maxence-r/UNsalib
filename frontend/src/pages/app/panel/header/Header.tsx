import { Info } from "lucide-react";

import "./Header.css";
import { IconButton } from "../../../../components/button/Button.js";
import CampusBannerUrl from "../../../../assets/imgs/campus/sciences-et-techniques.jpg";
import { AboutModal } from "../modals/AboutModal.js";
import { InstallButton } from "./InstallButton.js";
import { useModal } from "../../../../components/modal/Modal.js";

function Header() {
    const { open: openAboutModal } = useModal("about", <AboutModal />);

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
                        onClick={openAboutModal}
                        icon={<Info />}
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
