export const dynamic = "force-dynamic";

import "./maintenance.css";
import App from "./app";
import "@/_utils/theme.css";
import { redirect, RedirectType } from "next/navigation";

async function shouldShowMaintenancePage() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/app-state`, {
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const state = await response.json();
        return state.maintenance === true;
    } catch (error) {
        console.error("Impossible de récupérer le mode de l'application.");
        console.error(error);
        return false;
    }
}

export default async function MaintenancePage() {
    if (!(await shouldShowMaintenancePage())) {
        redirect("/", RedirectType.replace);
    }

    return <App></App>
}
