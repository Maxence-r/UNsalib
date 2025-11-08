"use client";

import { useState, useEffect } from "react";
import { ChartPie, House, Pen } from "lucide-react";

import { ApiUserAccount } from "./_utils/types";
import Sidebar from "./_components/sidebar/sidebar";
import Navbar from "./_components/navbar/navbar";
import HomePage from "./_components/home/home";
import StatsPage from "./_components/stats/stats";
import { socket } from "@/_utils/socket";
import { publish } from "./_utils/events";

export default function App({ userAccount }: { userAccount: ApiUserAccount }) {
    const tabs = [
        { id: "home", name: "Accueil", icon: <House /> },
        { id: "manage", name: "Gestion", icon: <Pen /> },
        { id: "stats", name: "Statistiques", icon: <ChartPie /> }
    ]
    const [selectedTab, setSelectedTab] = useState("home");

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            console.log("Connected to Socket.IO server");
        }

        function onDisconnect() {
            console.log("Disconnected from Socket.IO server");
        }

        function onError(error: string) {
            console.error("Socket.IO error:", error);
        }

        function onHomeUpdated() {
            publish("homeUpdated");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("dashboard:home:updated", onHomeUpdated);
        socket.on("error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("dashboard:home:updated", onHomeUpdated);
            socket.off("error", onError);
        };
    }, []);

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
            {selectedTab === "stats" && <StatsPage />}
        </div>
    );
}