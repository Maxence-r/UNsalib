"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import Button from "@/_components/button";
import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import MobileMenu from "../mobile-menu/mobile-menu";
import "./navbar.css";
import { Menu } from "lucide-react";

export default function Navbar({
    userAccount,
    className,
    setSelectedTab,
    selectedTab
}: {
    userAccount: ApiUserAccount,
    className: string,
    setSelectedTab: (tab: string) => void,
    selectedTab: string
}) {
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    const logout = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`,
                { credentials: "include" }
            );
            const logoutState = await response.json();
            if (logoutState.message === "LOGOUT_SUCCESSFUL") {
                window.location.href = "/admin/auth";
            } else {
                throw new Error();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={`navbar ${className}`}>
            <MobileMenu userAccount={userAccount} selectedTab={selectedTab} setSelectedTab={setSelectedTab} isOpen={openMobileMenu} setIsOpen={setOpenMobileMenu} />
            <button onClick={() => setOpenMobileMenu(!openMobileMenu)} className="mobile-menu-button"><Menu size={24} /></button>
            <h1>UNsalib</h1>
            <Image className="account-icon" fill src={`data:image/png;base64,${userAccount.icon}`} alt="Account icon" />
        </div >
    );
}