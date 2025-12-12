import {
    useState,
    useEffect,
    useRef,
    cloneElement,
    type ReactElement,
} from "react";
import { LogOut } from "lucide-react";

// import { logout } from "../../_utils/client-actions";
import type { ApiDataAccount } from "../../../utils/types/api.type";
import "./sidebar.css";
import { NavLink, useLocation, useNavigate } from "react-router";

interface Action {
    name: string;
    icon: ReactElement;
    path: string;
}

function Action({ name, icon, path }: Action) {
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                ["action", isActive ? "active" : ""].join(" ")
            }
        >
            {icon}
            <span>{name}</span>
        </NavLink>
        // <button
        //     className={`action ${selected ? "selected" : ""}`}
        //     onClick={onClick}
        //     key={`action ${name}`}
        // >
        //     {icon}
        //     <span>{name}</span>
        // </button>
    );
}

function ActionsList({ actions }: { actions: Action[] }) {
    return (
        <div className="actions-list">
            {actions.map((action) => {
                return (
                    <Action
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

function useOutsideClickHandler(
    ref: React.RefObject<HTMLElement | null>,
    stateHook: boolean,
    setStateHook: (state: boolean) => void,
) {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node) &&
                stateHook
            ) {
                setStateHook(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => document.removeEventListener("click", handleClickOutside);
    }, [ref, stateHook, setStateHook]);
}

export default function Sidebar({
    userAccount,
    currentViewId,
    embedded,
    className,
    tabsList,
}: {
    userAccount: ApiDataAccount;
    currentViewId: string;
    embedded: boolean;
    className: string;
    tabsList: {
        id: string;
        name: string;
        icon: ReactElement<{ size: number }>;
    }[];
}) {
    const [openUserMenu, setOpenUserMenu] = useState<boolean>(false);
    const accountMenuRef = useRef<HTMLDivElement | null>(null);
    useOutsideClickHandler(accountMenuRef, openUserMenu, setOpenUserMenu);
    const navigate = useNavigate();
    const location = useLocation().pathname;

    const handleLogout = async () => {
        // const result = await logout();
        // if (result.success) {
        //     window.location.href = "/admin/auth";
        // } else {
        //     console.error(result.error);
        // }
    };

    return (
        <div className={`sidebar ${className}${embedded ? "" : " shrinkable"}`}>
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
            <ActionsList
                actions={tabsList.map((tab) => ({
                    icon: cloneElement(tab.icon, { size: 20 }),
                    name: tab.name,
                    path: `/dashboard/${tab.id}`,
                }))}
            />
            <span className="spacer" />
            <ActionsList
                actions={[
                    {
                        icon: (
                            <img
                                src={`data:image/png;base64,${userAccount.icon}`}
                                alt=""
                            />
                        ),
                        name: `${userAccount.name} ${userAccount.lastname}`,
                        path: "/dashboard/account",
                    },
                    // {
                    //     icon: <LogOut size={20} />,
                    //     name: "Déconnexion",
                    //     path: `/dashboard/${tab.id}`,
                    // },
                ]}
            />
        </div>
    );
}
