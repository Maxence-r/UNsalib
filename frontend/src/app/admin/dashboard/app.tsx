"use client";

import { useState } from "react";
import { ChartPie, House, Pen, MessageSquare } from "lucide-react";

import { ApiUserAccount } from "./_utils/types";
import Sidebar from "./_components/sidebar/sidebar";
import Navbar from "./_components/navbar/navbar";
import HomePage from "./_components/home/home";
import StatsPage from "./_components/stats/stats";
import FeedbackPage from "./_components/feedback/feedback";
import ManagePage from "./_components/manage/manage";

export default function App({ userAccount }: { userAccount: ApiUserAccount }) {
    const tabs = [
        { id: "home", name: "Accueil", icon: <House /> },
        { id: "manage", name: "Gestion", icon: <Pen /> },
        { id: "stats", name: "Statistiques", icon: <ChartPie /> },
        { id: "feedback", name: "Retours", icon: <MessageSquare /> }
    ]
    const [selectedTab, setSelectedTab] = useState("home");

    return (
        <div className="page dashboard">
            <Navbar
                userAccount={userAccount}
                selectedTabId={selectedTab}
                setSelectedTabId={setSelectedTab}
                className="small-screen-nav"
                tabsList={tabs}
            />
            <Sidebar
                userAccount={userAccount}
                selectedTabId={selectedTab}
                setSelectedTabId={setSelectedTab}
                embedded={false}
                className="large-screen-nav"
                tabsList={tabs}
            />
            {selectedTab === "home" && <HomePage />}
            {selectedTab === "manage" && <ManagePage />}
            {selectedTab === "stats" && <StatsPage />}
            {selectedTab === "feedback" && <FeedbackPage />}
        </div>
    );
}