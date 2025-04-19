"use client";

import Image from "next/image";
import { useState, ReactElement } from "react";

import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import MobileMenu from "./mobile-menu";
import "./navbar.css";
import { Menu } from "lucide-react";

export default function Navbar({
    userAccount,
    className,
    setSelectedTabId,
    selectedTabId,
    tabsList
}: {
    userAccount: ApiUserAccount,
    className: string,
    setSelectedTabId: (tab: string) => void,
    selectedTabId: string,
    tabsList: { id: string, name: string, icon: ReactElement<{ size: number }> }[]
}) {
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    return (
        <div className={`navbar ${className}`}>
            <MobileMenu
                userAccount={userAccount}
                selectedTabId={selectedTabId}
                setSelectedTabId={setSelectedTabId}
                isOpen={openMobileMenu}
                setIsOpen={setOpenMobileMenu}
                tabsList={tabsList}
            />
            <button onClick={() => setOpenMobileMenu(!openMobileMenu)} className="mobile-menu-button"><Menu size={24} /></button>
            <h2>{
                tabsList.find(tab => tab.id === selectedTabId)?.name || ""
            }</h2>
            <Image className="account-icon" fill src={`data:image/png;base64,${userAccount.icon}`} alt="Account icon" />
        </div >
    );
}