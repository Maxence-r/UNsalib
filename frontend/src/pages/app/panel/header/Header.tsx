import { Info } from "lucide-react";
import { useState } from "react";

import "./Header.css";
import { IconButton } from "../../../../components/button/Button.js";
// import PWAInstallButton from "../installButton.js";
import CampusBannerUrl from "../../../../assets/imgs/campus/sciences-et-techniques.jpg";
import { AboutModal } from "../modals/AboutModal.js";
import { InstallButton } from "./InstallButton.js";

function Header() {
    const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

    return (
        <header className="header">
            <AboutModal
                isOpen={isAboutModalOpen}
                setIsOpen={setIsAboutModalOpen}
            />
            <div className="top-bar">
                <div className="branding">
                    <img src="/logo96.png" alt="UNsalib logo" />
                    <h1>UNsalib</h1>
                </div>
                <div className="actions">
                    <InstallButton />
                    <IconButton
                        onClick={() => {
                            setIsAboutModalOpen(true);
                        }}
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
