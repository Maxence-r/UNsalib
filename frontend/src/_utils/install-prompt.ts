export const CLIENT_UUID_COOKIE = "clientUuid";
export const INSTALL_PROMPT_VISIT_COUNT_COOKIE = "installPromptVisitCount";
export const INSTALL_PROMPT_SHOWN_COOKIE = "installPromptShown";
export const INSTALL_PROMPT_TRIGGER_COOKIE = "installPromptTrigger";
export const INSTALL_PROMPT_THIRD_VISIT_TRIGGER = "third-visit";
export const INSTALL_PROMPT_QRCODE_TRIGGER = "qrcode";
const IOS_BROWSER_EXCLUSION_PATTERN = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|YaBrowser/i;
const CHROMIUM_BROWSER_PATTERN = /Chrome|Chromium|Edg|OPR|SamsungBrowser|Brave/i;

export function getCookieDomain(domain?: string) {
    if (!domain) {
        return undefined;
    }

    const normalizedDomain = domain.trim();

    if (!normalizedDomain || normalizedDomain === "localhost" || normalizedDomain === ".localhost") {
        return undefined;
    }

    return normalizedDomain.startsWith(".") ? normalizedDomain : `.${normalizedDomain}`;
}

export function buildClientCookieString(
    name: string,
    value: string,
    {
        maxAge,
        domain
    }: {
        maxAge?: number,
        domain?: string
    } = {}
) {
    const cookieDomain = getCookieDomain(domain);

    return `${name}=${value}; path=/; SameSite=Lax;${typeof maxAge === "number" ? ` Max-Age=${maxAge};` : ""}${cookieDomain ? ` domain=${cookieDomain};` : ""}`;
}

export function isIosSafariInstallableUserAgent(userAgent?: string) {
    if (!userAgent) {
        return false;
    }

    const isIosDevice = /iPad|iPhone|iPod/i.test(userAgent)
        || (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent));
    const isWebkit = /WebKit/i.test(userAgent);

    return isIosDevice && isWebkit && !IOS_BROWSER_EXCLUSION_PATTERN.test(userAgent);
}

export function isChromiumInstallPromptUserAgent(userAgent?: string) {
    if (!userAgent) {
        return false;
    }

    const isIosDevice = /iPad|iPhone|iPod/i.test(userAgent)
        || (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent));

    return CHROMIUM_BROWSER_PATTERN.test(userAgent) && !isIosDevice;
}

export function isLikelyPwaCapableUserAgent(userAgent?: string) {
    return isIosSafariInstallableUserAgent(userAgent) || isChromiumInstallPromptUserAgent(userAgent);
}
