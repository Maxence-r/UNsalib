import { useState, useEffect, useCallback, type JSX } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router";

import "./MobileAppbar.css";
import { Sidebar } from "../sidebar/Sidebar";
import { IconButton } from "../../../components/button/Button";

function MobileMenu({
    accountName,
    accountLastname,
    viewsList,
    isOpen,
    close,
}: {
    accountName?: string;
    accountLastname?: string;
    viewsList: {
        id: string;
        name: string;
        icon: JSX.Element;
    }[];
    isOpen: boolean;
    close: () => void;
}) {
    const location = useLocation();

    const handleScrimClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).classList.contains("scrim")) {
            close();
        }
    };

    useEffect(() => {
        close();
    }, [location, close]);

    return (
        <div className={`menu${isOpen ? " open" : ""}`}>
            <div className="scrim" onClick={handleScrimClick} />
            <div className="window">
                <Sidebar
                    accountName={accountName}
                    accountLastname={accountLastname}
                    embedded={true}
                    viewsList={viewsList}
                />
            </div>
        </div>
    );
}

function MobileAppbar({
    accountName,
    accountLastname,
    viewsList,
    currentViewTitle,
}: {
    accountName?: string;
    accountLastname?: string;
    viewsList: {
        id: string;
        name: string;
        icon: JSX.Element;
    }[];
    currentViewTitle: string;
}) {
    const [openMenu, setOpenMenu] = useState<boolean>(false);

    const closeMenu = useCallback(() => setOpenMenu(false), []);

    return (
        <div className="mobile-appbar">
            <MobileMenu
                accountName={accountName}
                accountLastname={accountLastname}
                viewsList={viewsList}
                isOpen={openMenu}
                close={closeMenu}
            />
            <IconButton
                icon={<Menu />}
                onClick={() => setOpenMenu(true)}
                secondary
            />
            <h2>{currentViewTitle}</h2>
            <img
                className="account-icon"
                // src={`data:image/png;base64,${userAccount.icon}`}
                alt="Account icon"
            />
        </div>
    );
}

export { MobileAppbar };
