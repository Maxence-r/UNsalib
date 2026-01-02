import { cloneElement, type JSX } from "react";
import { LogOut } from "lucide-react";
import { NavLink } from "react-router";

import "./Sidebar.css";

interface Link {
    name: string;
    icon: JSX.Element;
    path: string;
}

function Link({ name, icon, path }: Link) {
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

function LinksList({ actions }: { actions: Link[] }) {
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
        icon: JSX.Element;
    }[];
}) {
    return (
        <div className={`sidebar${embedded ? "" : " shrinkable"}`}>
            <div className="branding">
                <img
                    className="logo"
                    src="/logo96.png"
                    alt="logo"
                    width={96}
                    height={96}
                />
                <h1>UNsalib</h1>
            </div>
            <span className="divider" />
            <LinksList
                actions={viewsList.map((tab) => ({
                    icon: tab.icon,
                    name: tab.name,
                    path: `/dashboard/${tab.id}`,
                }))}
            />
            <span className="spacer" />
            <LinksList
                actions={[
                    {
                        icon: (
                            <img
                                // src={`data:image/png;base64,${userAccount.icon}`}
                                alt=""
                            />
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
    );
}

export { Sidebar };
