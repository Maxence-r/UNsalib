// import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import type { ReactElement } from "react";

// import { ApiUserAccount } from "./_utils/types";
import { Sidebar } from "./sidebar/Sidebar";
// import Navbar from "./_components/navbar/navbar";
// import HomePage from "./_components/home/home";
// import StatsPage from "./_components/stats/stats";
import { DASHBOARD_VIEWS } from "./DashboardViews";
import "./Dashboard.css";
import { useDeviceType } from "../../utils/hooks/device.hook";
import { useAccountStore, type Account } from "../../stores/account.store";
import { MobileAppbar } from "./mobile-appbar/MobileAppbar";
import { Layout } from "../../components/layout/Layout";

function Dashboard(): ReactElement {
    const location = useLocation().pathname;
    const currentViewTitle = ((): string | undefined => {
        const splittedLocation = location
            .split("/")
            .filter((part) => part !== "");
        if (splittedLocation.length < 2) return;
        const currentView = DASHBOARD_VIEWS.find(
            (view) => view.id === splittedLocation[1],
        );

        if (currentView) {
            if (splittedLocation.length === 3 && "subviews" in currentView) {
                return (
                    currentView.name +
                    " : " +
                    currentView.subviews.find(
                        (subview) => subview.id === splittedLocation[2],
                    )?.name
                );
            }
            return currentView.name;
        }
    })();
    const isMobile = useDeviceType() === "mobile";
    const account = useAccountStore<Account | null>((s) => s.account);

    return (
        <main id="dashboard">
            {isMobile ? (
                <MobileAppbar
                    accountName={account?.name}
                    accountLastname={account?.lastname}
                    viewsList={DASHBOARD_VIEWS}
                    currentViewTitle={currentViewTitle ?? ""}
                />
            ) : (
                <Sidebar
                    accountName={account?.name}
                    accountLastname={account?.lastname}
                    embedded={false}
                    viewsList={DASHBOARD_VIEWS}
                />
            )}
            <div className="main">
                <Layout title={isMobile ? undefined : currentViewTitle}>
                    <Outlet />
                </Layout>
            </div>
        </main>
    );
}

export { Dashboard };
