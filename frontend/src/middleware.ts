import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const clientId = req.cookies.get("clientUuid")?.value;

    if (!clientId) {
        const newClientId = uuidv4();
        res.cookies.set("clientUuid", newClientId, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            domain: "." + process.env.NEXT_PUBLIC_DOMAIN
        });
    }

    if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname != "/admin/old") {
        const userToken = req.cookies.get("token")?.value;
        if (userToken) {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/status`,
                    {
                        headers: {
                            Cookie: `token=${userToken}`
                        }
                    }
                );
                const loginStatus = await response.json();
                if (loginStatus.message === "LOGGED_IN") {
                    if (req.nextUrl.pathname.startsWith("/admin/auth")) {
                        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
                    } else {
                        return res;
                    }
                }
            } catch { }
        }
        if (!req.nextUrl.pathname.startsWith("/admin/auth")) {
            return NextResponse.redirect(new URL("/admin/auth", req.url));
        }
    }

    return res;
}

export const config = {
    matcher: "/:path*"
};