"use client";

import Image from "next/image";
import { useState, useEffect, useRef, cloneElement, ReactElement } from "react";
import { Pen, House, ChartPie, LogOut } from "lucide-react";

import { logout } from "../../_utils/client-actions";
import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import "./sidebar.css";

type Action = {
    onClick: () => void,
    name: string,
    icon: ReactElement,
    selected: boolean
};

function Action({ onClick, name, icon, selected }: Action) {
    return (
        <button className={`action ${selected ? "selected" : ""}`} onClick={onClick} key={`action ${name}`}>
            {icon}
            <span>{name}</span>
        </button>
    );
}

function ActionsList({ actions }: { actions: Action[] }) {
    return (
        <div className="actions-list">
            {actions.map(action => {
                return (
                    <Action
                        onClick={action.onClick}
                        name={action.name}
                        icon={action.icon}
                        key={`action ${action.name}`}
                        selected={action.selected}
                    />
                );
            })}
        </div>
    );
}

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

export default function Sidebar({
    userAccount,
    setSelectedTabId,
    selectedTabId,
    embedded,
    className,
    tabsList
}: {
    userAccount: ApiUserAccount,
    setSelectedTabId: (tab: string) => void,
    selectedTabId: string,
    embedded: boolean,
    className: string,
    tabsList: { id: string, name: string, icon: ReactElement<{ size: number }> }[]
}) {
    const [openUserMenu, setOpenUserMenu] = useState<boolean>(false);
    const accountMenuRef = useRef<HTMLDivElement | null>(null);
    useOutsideClickHandler(accountMenuRef, openUserMenu, setOpenUserMenu);

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            window.location.href = "/admin/auth";
        } else {
            console.error(result.error);
        }
    };

    return (
        <div className={`sidebar ${className}${embedded ? "" : " shrinkable"}`}>
            <div className="branding">
                <Image className="logo" src="/logo96.png" alt="logo" width={96} height={96}></Image>
                <h1>UNsalib</h1>
            </div>
            <span className="divider" />
            <ActionsList
                actions={tabsList.map(tab => ({
                    icon: cloneElement(tab.icon, { size: 20 }),
                    name: tab.name,
                    selected: selectedTabId === tab.id ? true : false,
                    onClick: () => setSelectedTabId(tab.id)
                }))


                    // [
                    //     { icon: <House size={20} />, name: "Accueil", selected: selectedTabId === "home" ? true : false, onClick: () => setSelectedTabId("home") },
                    //     { icon: <Pen size={20} />, name: "Gestion", selected: selectedTabId === "manage" ? true : false, onClick: () => setSelectedTabId("manage") },
                    //     { icon: <ChartPie size={20} />, name: "Statistiques", selected: selectedTabId === "stats" ? true : false, onClick: () => setSelectedTabId("stats") }
                    // ]
                }
            />
            <span className="spacer" />
            <ActionsList
                actions={[
                    { icon: <Image fill src={`data:image/png;base64,${userAccount.icon}`} alt="" />, name: `${userAccount.name} ${userAccount.lastname}`, selected: selectedTabId === "account" ? true : false, onClick: () => setSelectedTabId("account") },
                    { icon: <LogOut size={20} />, name: "Déconnexion", selected: false, onClick: handleLogout }
                ]}
            />
        </div >
    );
}