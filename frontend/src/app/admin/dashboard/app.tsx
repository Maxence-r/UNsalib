"use client";

import { useState } from "react";

import { ApiUserAccount } from "./_utils/types";
import Sidebar from "./_components/sidebar/sidebar";
import Navbar from "./_components/navbar/navbar";
import HomePage from "./_components/home/home";

export default function App({ userAccount }: { userAccount: ApiUserAccount }) {
    const [selectedTab, setSelectedTab] = useState("home");

    return (
        <div className="page dashboard">
            <Navbar userAccount={userAccount} selectedTab={selectedTab} setSelectedTab={setSelectedTab} className="small-screen-nav" />
            <Sidebar userAccount={userAccount} selectedTab={selectedTab} setSelectedTab={setSelectedTab} embedded={false} className="large-screen-nav" />
            {selectedTab === "home" && <HomePage />}
        </div>
    );
}