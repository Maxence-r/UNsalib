import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import {
    CLIENT_UUID_COOKIE,
    INSTALL_PROMPT_QRCODE_TRIGGER,
    INSTALL_PROMPT_SHOWN_COOKIE,
    INSTALL_PROMPT_THIRD_VISIT_TRIGGER,
    INSTALL_PROMPT_TRIGGER_COOKIE,
    INSTALL_PROMPT_VISIT_COUNT_COOKIE,
    getCookieDomain,
    isLikelyPwaCapableUserAgent
} from "@/_utils/install-prompt";

function getCookieOptions() {
    const domain = getCookieDomain(process.env.NEXT_PUBLIC_DOMAIN);

    return {
        sameSite: "lax" as const,
        path: "/",
        ...(domain ? { domain } : {})
    };
}

function ensureClientCookie(
    response: NextResponse,
    existingClientId: string | undefined,
    resolvedClientId: string,
    cookieOptions: ReturnType<typeof getCookieOptions>
) {
    if (!existingClientId) {
        response.cookies.set(CLIENT_UUID_COOKIE, resolvedClientId, {
            httpOnly: true,
            ...cookieOptions
        });
    }

    return response;
}

async function trackQrcodeReach(clientId: string, userAgent: string) {
    if (!process.env.NEXT_PUBLIC_API_URL) {
        return;
    }

    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/interactions`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "user-agent": userAgent,
                "cookie": `${CLIENT_UUID_COOKIE}=${clientId};`
            },
            body: JSON.stringify({ type: "qrcode_reached" }),
            cache: "no-store"
        });
    } catch { }
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const userAgent = req.headers.get("user-agent") ?? "";
    const cookieOptions = getCookieOptions();
    const clientId = req.cookies.get(CLIENT_UUID_COOKIE)?.value;
    const resolvedClientId = clientId ?? uuidv4();
    const installPromptShown = req.cookies.get(INSTALL_PROMPT_SHOWN_COOKIE)?.value === "true";
    const isLikelyPwaCapable = isLikelyPwaCapableUserAgent(userAgent);
    const isIgnoredPath = pathname.startsWith("/_next")
        || pathname.startsWith("/api")
        || pathname.startsWith("/favicon")
        || pathname.includes(".");

    if (isIgnoredPath) {
        return NextResponse.next();
    }

    if (pathname === "/qrcode" || pathname === "/qrcode/") {
        await trackQrcodeReach(resolvedClientId, userAgent);

        const redirectResponse = ensureClientCookie(
            NextResponse.redirect(new URL("/", req.url)),
            clientId,
            resolvedClientId,
            cookieOptions
        );

        if (isLikelyPwaCapable) {
            redirectResponse.cookies.set(INSTALL_PROMPT_TRIGGER_COOKIE, INSTALL_PROMPT_QRCODE_TRIGGER, {
                maxAge: 60 * 5,
                ...cookieOptions
            });
        }

        return redirectResponse;
    }

    const res = ensureClientCookie(NextResponse.next(), clientId, resolvedClientId, cookieOptions);

    if (pathname === "/" && isLikelyPwaCapable && !installPromptShown) {
        const visitCount = Number.parseInt(req.cookies.get(INSTALL_PROMPT_VISIT_COUNT_COOKIE)?.value ?? "0", 10) || 0;
        const nextVisitCount = visitCount + 1;

        res.cookies.set(INSTALL_PROMPT_VISIT_COUNT_COOKIE, nextVisitCount.toString(), {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            ...cookieOptions
        });

        if (nextVisitCount >= 3) {
            res.cookies.set(INSTALL_PROMPT_TRIGGER_COOKIE, INSTALL_PROMPT_THIRD_VISIT_TRIGGER, {
                maxAge: 60 * 5,
                ...cookieOptions
            });
        }
    }

    if (pathname.startsWith("/admin") && pathname !== "/admin/old") {
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
                    if (pathname.startsWith("/admin/auth")) {
                        return ensureClientCookie(
                            NextResponse.redirect(new URL("/admin/dashboard", req.url)),
                            clientId,
                            resolvedClientId,
                            cookieOptions
                        );
                    }

                    return res;
                }
            } catch { }
        }
        if (!pathname.startsWith("/admin/auth")) {
            return ensureClientCookie(
                NextResponse.redirect(new URL("/admin/auth", req.url)),
                clientId,
                resolvedClientId,
                cookieOptions
            );
        }
    }

    return res;
}

export const config = {
    matcher: "/:path*"
};
