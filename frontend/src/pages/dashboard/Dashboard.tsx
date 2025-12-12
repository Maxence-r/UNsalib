// import { useState, useEffect } from "react";
import { useLocation } from "react-router";

// import { ApiUserAccount } from "./_utils/types";
import Sidebar from "./sidebar/sidebar";
// import Navbar from "./_components/navbar/navbar";
// import HomePage from "./_components/home/home";
// import StatsPage from "./_components/stats/stats";
import { VIEWS } from "./constants";

function Dashboard() {
    const location = useLocation().pathname;

    const currentViewId = location.split("/")[1];
    // const tabs = [
    //     { id: "home", name: "Accueil", icon: <House /> },
    //     { id: "manage", name: "Gestion", icon: <Pen /> },
    //     { id: "stats", name: "Statistiques", icon: <ChartPie /> }
    // ]
    // const [selectedTab, setSelectedTab] = useState("home");

    return (
        <>
            {/* <Navbar
                userAccount={userAccount}
                selectedTabId={currentViewId}
                setSelectedTabId={setSelectedTab}
                className="small-screen-nav"
                tabsList={VIEWS}
            /> */}
            <Sidebar
                userAccount={{
                    icon: "zygefjf",
                    lastname: "Admin",
                    name: "UNsalib",
                    username: "unsalib",
                }}
                currentViewId={currentViewId}
                // setSelectedTabId={setSelectedTab}
                embedded={false}
                className="large-screen-nav"
                tabsList={VIEWS}
            />
            {/* {selectedTab === "home" && <HomePage />}
            {selectedTab === "stats" && <StatsPage />} */}
        </>
    );
}

export { Dashboard };
