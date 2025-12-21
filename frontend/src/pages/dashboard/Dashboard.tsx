// import { useState, useEffect } from "react";
import { useLocation } from "react-router";

// import { ApiUserAccount } from "./_utils/types";
import { Sidebar } from "./sidebar/Sidebar";
// import Navbar from "./_components/navbar/navbar";
// import HomePage from "./_components/home/home";
// import StatsPage from "./_components/stats/stats";
import { DASHBOARD_VIEWS } from "./DashboardRouter";
import "./Dashboard.css";
import { useDeviceType } from "../../utils/hooks/device.hook";
import { useAccountStore, type Account } from "../../stores/account.store";
import { MobileAppbar } from "./mobile-appbar/MobileAppbar";

function Dashboard() {
    const location = useLocation().pathname;
    const currentViewId = location.split("/")[2];
    const device = useDeviceType();
    const account = useAccountStore<Account | null>((s) => s.account);

    return (
        <main id="dashboard">
            {device === "mobile" ? (
                <MobileAppbar
                    accountName={account?.name}
                    accountLastname={account?.lastname}
                    viewsList={DASHBOARD_VIEWS}
                    currentViewTitle={
                        DASHBOARD_VIEWS.filter(
                            (view) => view.id === currentViewId,
                        )[0].name
                    }
                />
            ) : (
                <Sidebar
                    accountName={account?.name}
                    accountLastname={account?.lastname}
                    embedded={false}
                    viewsList={DASHBOARD_VIEWS}
                />
            )}
            {
                DASHBOARD_VIEWS.filter((view) => view.id === currentViewId)[0]
                    .component
            }
        </main>
    );
}

export { Dashboard };
