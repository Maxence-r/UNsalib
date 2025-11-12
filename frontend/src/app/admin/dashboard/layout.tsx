import type { Metadata } from "next";
import Toast from "@/_components/toast";

export const metadata: Metadata = {
    title: "UNsalib - Tableau de bord",
    description: "Trouvez les salles libres de Nantes Université et affichez leurs emplois du temps"
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {children}
            <Toast />
        </>
    );
};