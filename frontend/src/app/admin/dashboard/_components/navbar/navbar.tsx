"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import Button from "@/_components/button";
import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import "./navbar.css";

function useOutsideClickHandler(ref: React.RefObject<HTMLElement | null>, stateHook: boolean, setStateHook: (state: boolean) => void) {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node) && stateHook) {
                setStateHook(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => document.removeEventListener("click", handleClickOutside);
    }, [ref, stateHook, setStateHook]);
}

export default function Navbar({ userAccount }: { userAccount: ApiUserAccount }) {
    const [openUserMenu, setOpenUserMenu] = useState<boolean>(false);
    const accountMenuRef = useRef<HTMLDivElement | null>(null);
    useOutsideClickHandler(accountMenuRef, openUserMenu, setOpenUserMenu);

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
        <div className="navbar">
            <Image className="logo" src="/logo96.png" alt="logo" width={96} height={96}></Image>
            <h1>UNsalib</h1>
            <span className="spacer"></span>
            <div className="navbar-account">
                <button id="account-button" className="button" onClick={() => setOpenUserMenu(true)}>
                    <span>{`${userAccount.name} ${userAccount.lastname}`}</span>
                    <Image className="account-icon" fill src={`data:image/png;base64,${userAccount.icon}`} alt="Account icon" />
                </button>
                <div
                    id="account-menu"
                    className={openUserMenu ? "opened" : ""}
                    ref={accountMenuRef}
                >
                    <div className="account-infos">
                        <Image className="account-icon" fill src={`data:image/png;base64,${userAccount.icon}`} alt="Account icon" />
                        <div>
                            <h2>{`${userAccount.name} ${userAccount.lastname}`}</h2>
                            <span>{`@${userAccount.username}`}</span>
                        </div>
                    </div>
                    <Button className="logout" onClick={logout}>Se déconnecter</Button>
                </div>
            </div>
        </div >
    );
}