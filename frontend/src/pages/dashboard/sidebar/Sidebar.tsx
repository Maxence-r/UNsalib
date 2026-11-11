import { cloneElement, useState, type ReactElement } from "react";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import "./Sidebar.css";
import type { GroupView, View } from "../DashboardViews";
import { useDeviceType } from "../../../utils/hooks/device.hook";

interface Link {
    name: string;
    path: string;
    icon?: ReactElement<{ size: number }>;
}

interface GroupLink extends Omit<Link, "path"> {
    sublinks: Link[];
    icon: ReactElement<{ size: number }>;
}

function Link({ name, icon, path }: Link): ReactElement {
    return (
        <NavLink
            to={path}
            className={({ isActive }) => `link${isActive ? " active" : ""}`}
        >
            {icon && cloneElement(icon, { size: 20 })}
            <span>{name}</span>
        </NavLink>
    );
}

function GroupLink({ name, icon, sublinks }: GroupLink): ReactElement {
    const location = useLocation().pathname;
    const [isManuallyExpanded, setIsManuallyExpanded] = useState<
        boolean | null
    >(null);
    const hasActiveSublink = sublinks.some((sublink) =>
        location.startsWith(sublink.path),
    );
    const isTablet = useDeviceType() === "tablet";
    const isExpanded = isTablet || (isManuallyExpanded ?? hasActiveSublink);

    const handleClick = (): void => {
        setIsManuallyExpanded((expanded) => !(expanded ?? hasActiveSublink));
    };

    return (
        <div className="group-link">
            <button onClick={handleClick}>
                {cloneElement(icon, { size: 20 })}
                <span>{name}</span>
                {isExpanded ? (
                    <ChevronUp size={20} />
                ) : (
                    <ChevronDown size={20} />
                )}
            </button>
            {isExpanded && (
                <LinksList
                    actions={
                        isTablet
                            ? sublinks.map((sublink) => ({ ...sublink, icon }))
                            : sublinks
                    }
                />
            )}
        </div>
    );
}

function LinksList({
    actions,
}: {
    actions: (Link | GroupLink)[];
}): ReactElement {
    return (
        <div className="links-list">
            {actions.map((action) => {
                return "sublinks" in action ? (
                    <GroupLink
                        name={action.name}
                        icon={action.icon}
                        key={`action ${action.name}`}
                        sublinks={action.sublinks}
                    />
                ) : (
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
    viewsList: (View | GroupView)[];
}): ReactElement {
    return (
        <div className={`sidebar${embedded ? "" : " shrinkable"}`}>
            <div className="branding">
                <img src="/logo96.png" alt="logo" />
                <h1>UNsalib</h1>
            </div>
            <div className="nav">
                <LinksList
                    actions={viewsList.map((view) => ({
                        icon: view.icon,
                        name: view.name,
                        path: `/dashboard/${view.id}`,
                        ...("subviews" in view && {
                            sublinks: view.subviews.map((subview) => ({
                                name: subview.name,
                                path: `/dashboard/${view.id}/${subview.id}`,
                            })),
                        }),
                    }))}
                />
                <LinksList
                    actions={[
                        {
                            icon: (
                                <div className="pp">
                                    <span>
                                        {accountName && accountLastname
                                            ? `${accountName[0]}${accountLastname[0]}`.toUpperCase()
                                            : "?"}
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
