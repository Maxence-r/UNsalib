export const dynamic = "force-dynamic";

import "@/_utils/theme.css";
import "../maintenance/maintenance.css";
import Image from "next/image";
import { redirect, RedirectType } from "next/navigation";

async function shouldShowVacationPage() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/app-state`, {
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const state = await response.json();
        return state.vacation === true;
    } catch (error) {
        console.error("Impossible de recuperer le mode de l'application.");
        console.error(error);
        return false;
    }
}

export default async function VacancesPage() {
    if (!(await shouldShowVacationPage())) {
        redirect("/", RedirectType.replace);
    }

    return (
        <main tabIndex={-1} className="status-page vacation-page">
            <section className="status-content">
                <Image className="status-logo" src="/logo96.png" alt="UNsalib" width={48} height={48} priority />
                <span className="vacation-mark">UNsalib</span>
                <h1>Bonnes vacances</h1>
                <p>UNsalib revient a la rentree.</p>
                <span>Profitez bien de la pause.</span>
            </section>
        </main>
    );
}
