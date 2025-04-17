"use client";

import "./mobile-menu.css";
import Sidebar from "../sidebar/sidebar";
import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import { useEffect } from "react";

export default function MobileMenu({
    userAccount,
    isOpen,
    setIsOpen,
    setSelectedTab,
    selectedTab
}: {
    userAccount: ApiUserAccount,
    isOpen: boolean,
    setIsOpen: (state: boolean) => void
    setSelectedTab: (tab: string) => void,
    selectedTab: string
}) {
    useEffect(() => { 
        setIsOpen(false);
    }, [selectedTab, setIsOpen])

    return (
        <div id="mobile-menu" className={isOpen ? "opened" : ""}>
            <div
                id="mobile-scrim"
                onClick={(event) => {
                    const target = event.target as HTMLInputElement;
                    if (target.id != "mobile-window") {
                        setIsOpen(false);
                    }
                }}
            ></div>
            <div id="mobile-window">
                <Sidebar userAccount={userAccount} selectedTab={selectedTab} setSelectedTab={setSelectedTab} embedded={true} className="mobile-menu-sidebar" />
            </div>
        </div>
    );
}