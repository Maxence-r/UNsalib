import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@/theme.css";

export const metadata: Metadata = {
    title: "UNsalib - Sciences et techniques",
    description: "Trouvez les salles libres de Nantes Université et affichez leurs emplois du temps",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#111111" },
    ]
};

const font = Space_Grotesk({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
    display: "swap"
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="fr" className={font.className}>
            <body>
                {children}
            </body>
        </html>
    );
};