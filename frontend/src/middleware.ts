import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(req: NextRequest) {
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

    return res;
}

export const config = {
    matcher: "/:path*",
};