import { redirect } from "next/navigation"

export default function AdminDashboard() {
    // return (
    //     <iframe style={{ width: "100%", height: "100%", border: "none" }} src={process.env.NEXT_PUBLIC_SOKETIO_URL + "/admin"}></iframe>
    // );
    redirect(process.env.NEXT_PUBLIC_SOKETIO_URL + "/admin");
}