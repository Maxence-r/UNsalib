"use client";

import { ReactElement } from "react";

import "./mobile-menu.css";
import Sidebar from "../sidebar/sidebar";
import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import { useEffect } from "react";

export default function MobileMenu({
    userAccount,
    isOpen,
    setIsOpen,
    setSelectedTabId,
    selectedTabId,
    tabsList
}: {
    userAccount: ApiUserAccount,
    isOpen: boolean,
    setIsOpen: (state: boolean) => void
    setSelectedTabId: (tab: string) => void,
    selectedTabId: string,
    tabsList: { id: string, name: string, icon: ReactElement<{ size: number }> }[]
}) {
    useEffect(() => {
        setIsOpen(false);
    }, [selectedTabId, setIsOpen])

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
                <Sidebar
                    userAccount={userAccount}
                    selectedTabId={selectedTabId}
                    setSelectedTabId={setSelectedTabId}
                    embedded={true}
                    className="mobile-menu-sidebar"
                    tabsList={tabsList}
                />
            </div>
        </div>
    );
}