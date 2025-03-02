import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from 'next/font/google'
import "./globals.css";

export const metadata: Metadata = {
    title: "UNsalib - Sciences et techniques",
    description: "Trouvez les salles libres de Nantes Université et affichez leurs emplois du temps",
    themeColor: "#ffffff",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1
};

const font = Space_Grotesk({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className={font.className}>
            <body>
                <main tabIndex={-1}>
                    {children}
                </main>
            </body>
        </html>
    );
};