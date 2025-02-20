import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "UNsalib - Sciences et techniques",
    description: "Trouvez les salles libres de Nantes Université et affichez leurs emplois du temps"
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body>
                <main tabIndex={-1}>
                    {children}
                </main>
            </body>
        </html>
    );
}
