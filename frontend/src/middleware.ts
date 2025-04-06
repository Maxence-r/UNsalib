import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const clientId = req.cookies.get("clientId")?.value;

    if (!clientId) {
        const newClientId = uuidv4();
        res.cookies.set("clientId", newClientId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 365 * 24 * 60 * 60 // 1 year
        });
    }

    if (req.nextUrl.pathname.startsWith("/admin/beta/dashboard")) {
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
                console.log(loginStatus)
                if (loginStatus.message === "LOGGED_IN") {
                    return res;
                }
            } catch { }
        }
        return NextResponse.redirect(new URL("/admin/beta/auth", req.url));
    }

    return res;
}

export const config = {
    matcher: "/:path*"
};