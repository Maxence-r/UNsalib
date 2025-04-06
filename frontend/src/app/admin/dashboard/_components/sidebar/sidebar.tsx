"use client";

import Image from "next/image";
import { useState, useEffect, useRef, ReactNode } from "react";
import { Pen, House, ChartPie, LogOut } from "lucide-react";

import { logout } from "../../_utils/actions";
import { ApiUserAccount } from "@/app/admin/dashboard/_utils/types";
import "./sidebar.css";

type Action = {
    onClick: () => void,
    name: string,
    icon: ReactNode
};

function Action({ onClick, name, icon }: Action) {
    return (
        <button className="action" onClick={onClick} key={`action ${name}`}>
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
                    <Action onClick={action.onClick} name={action.name} icon={action.icon} key={`action ${action.name}`} />
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
                    { icon: <House size={20} />, name: "Accueil", onClick: () => { } },
                    { icon: <Pen size={20} />, name: "Gestion", onClick: () => { } },
                    { icon: <ChartPie size={20} />, name: "Statistiques", onClick: () => { } }
                ]}
            />
            <span className="spacer" />
            <ActionsList
                actions={[
                    { icon: <Image fill src={`data:image/png;base64,${userAccount.icon}`} alt="" />, name: `${userAccount.name} ${userAccount.lastname}`, onClick: () => { } },
                    { icon: <LogOut size={20} />, name: "Déconnexion", onClick: handleLogout }
                ]}
            />
        </div >
    );
}