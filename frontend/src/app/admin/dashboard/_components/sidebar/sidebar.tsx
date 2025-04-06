"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import { logout } from "../../_utils/actions";
import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import "./sidebar.css";

type Action = {
    onClick: () => void,
    name: string,
    iconType: "src" | "icon" | "base64" | "none",
    icon: string
};

function Action({ onClick, name, iconType, icon }: Action) {
    let iconNode = <></>;
    if (iconType === "src") {
        iconNode = <Image fill src={icon} alt="" />;
    } else if (iconType === "base64") {
        iconNode = <Image fill src={`data:image/png;base64,${icon}`} alt="" />;
    } else if (iconType === "icon") {
        iconNode = <i className="material-symbols-rounded">{icon}</i>;
    }
    return (
        <button className="action" onClick={onClick} key={`action ${name}`}>
            {iconNode}
            <span>{name}</span>
        </button>
    );
}

function ActionsList({ actions }: { actions: Action[] }) {
    return (
        <div className="actions-list">
            {actions.map(action => {
                return (
                    <Action onClick={action.onClick} name={action.name} iconType={action.iconType} icon={action.icon} key={`action ${action.name}`} />
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

export default function Sidebar({ userAccount, className }: { userAccount: ApiUserAccount, className: string }) {
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
        <div className={`sidebar ${className}`}>
            <div className="branding">
                <Image className="logo" src="/logo96.png" alt="logo" width={96} height={96}></Image>
                <h1>UNsalib</h1>
            </div>
            <span className="divider" />
            <ActionsList
                actions={[
                    { icon: "home", iconType: "icon", name: "Accueil", onClick: () => { } },
                    { icon: "edit", iconType: "icon", name: "Gestion", onClick: () => { } },
                    { icon: "query_stats", iconType: "icon", name: "Statistiques", onClick: () => { } }
                ]}
            />
            <span className="spacer" />
            <ActionsList
                actions={[
                    { icon: userAccount.icon, iconType: "base64", name: `${userAccount.name} ${userAccount.lastname}`, onClick: () => { } },
                    { icon: "logout", iconType: "icon", name: "Déconnexion", onClick: handleLogout }
                ]}
            />
        </div >
    );
}