import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "UNsalib - Sciences et techniques",
    description: "Trouvez les salles libres de Nantes Université et affichez leurs emplois du temps",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body tabIndex={-1}>
                {children}
            </body>
        </html>
    );
}
