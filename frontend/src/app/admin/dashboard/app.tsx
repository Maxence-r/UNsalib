"use client";

import { useState } from "react";

import { ApiUserAccount } from "./_utils/types";
import Sidebar from "./_components/sidebar/sidebar";
import HomePage from "./_components/home/home";

export default function App({ userAccount }: { userAccount: ApiUserAccount }) {
    const [selectedTab, setSelectedTab] = useState("home");

    return (
        <div className="page dashboard">
            <Sidebar userAccount={userAccount} selectedTab={selectedTab} setSelectedTab={setSelectedTab} className="large-screen-nav" />
            {selectedTab === "home" && <HomePage />}
        </div>
    );
}