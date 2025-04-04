import { Metadata } from "next";

export const metadata: Metadata = {
    title: "UNsalib - Authentification"
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children
};