export const dynamic = "force-dynamic"; // fix build error (Route / couldn't be rendered statically because it used `cookies`n)

import { cookies } from "next/headers";

import { ApiUserAccount } from "./_utils/types";
import App from "./app";
import "./dashboard.css";

async function getAccountInfos() {
    let account: ApiUserAccount = {
        icon: "",
        lastname: "",
        name: "",
        username: ""
    };
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/account-infos`, {
            headers: {
                "content-type": "application/json",
                "cookie": `token=${token};`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        account = await response.json();
        return account;
    } catch (error) {
        console.error("Impossible d'obtenir le compte utilisateur !");
        console.error(error);
    }
    return account;
}

export default async function PreFetchData() {
    return <App userAccount={await getAccountInfos()}></App>;
}