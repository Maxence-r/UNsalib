import { cloneElement, type ReactElement } from "react";
import { LogOut } from "lucide-react";
import { NavLink } from "react-router";

import "./Sidebar.css";

interface Link {
    name: string;
    icon: ReactElement<{ size: number }>;
    path: string;
}

function Link({ name, icon, path }: Link): ReactElement {
    return (
        <NavLink
            to={path}
            className={({ isActive }) => `link${isActive ? " active" : ""}`}
        >
            {cloneElement(icon, { size: 20 })}
            <span>{name}</span>
        </NavLink>
    );
}

function LinksList({ actions }: { actions: Link[] }): ReactElement {
    return (
        <div className="links-list">
            {actions.map((action) => {
                return (
                    <Link
                        name={action.name}
                        icon={action.icon}
                        key={`action ${action.name}`}
                        path={action.path}
                    />
                );
            })}
        </div>
    );
}

function Sidebar({
    accountName,
    accountLastname,
    embedded,
    viewsList,
}: {
    accountName?: string;
    accountLastname?: string;
    embedded: boolean;
    viewsList: {
        id: string;
        name: string;
        icon: ReactElement<{ size: number }>;
    }[];
}): ReactElement {
    return (
        <div className={`sidebar${embedded ? "" : " shrinkable"}`}>
            <div className="branding">
                <img src="/logo96.png" alt="logo" />
                <h1>UNsalib</h1>
            </div>
            <div className="nav">
                <LinksList
                    actions={viewsList.map((tab) => ({
                        icon: tab.icon,
                        name: tab.name,
                        path: `/dashboard/${tab.id}`,
                    }))}
                />
                <LinksList
                    actions={[
                        {
                            icon: (
                                <div className="pp">
                                    <span>
                                        {`${accountName?.[0]}${accountLastname?.[0]}`.toUpperCase()}
                                    </span>
                                </div>
                            ),
                            name:
                                accountName && accountLastname
                                    ? `${accountName} ${accountLastname}`
                                    : "Inconnu·e",
                            path: "/dashboard/account",
                        },
                        {
                            icon: <LogOut />,
                            name: "Déconnexion",
                            path: "/auth/logout",
                        },
                    ]}
                />
            </div>
        </div>
    );
}

export { Sidebar };
