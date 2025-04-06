"use client";

import { ApiUserAccount } from "./_utils/types";
import Sidebar from "./_components/sidebar/sidebar";
import HomePage from "./_components/home/home";

export default function App({ userAccount }: { userAccount: ApiUserAccount }) {
    return (
        <div className="page dashboard">
            <Sidebar userAccount={userAccount} className="large-screen-nav" />
            <HomePage />
        </div>
    );
}