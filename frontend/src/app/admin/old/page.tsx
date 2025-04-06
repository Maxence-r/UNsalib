import { redirect } from "next/navigation"

export default function LegacyDashboard() {
    redirect(process.env.NEXT_PUBLIC_SOKETIO_URL + "/admin");
}