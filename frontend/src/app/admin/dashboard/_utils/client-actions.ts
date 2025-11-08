import {
    ApiPlatforms,
    ApiUniqueVisitors,
    ApiUniqueHumanVisitors,
} from "@/_utils/api-types";

function getMonthFirstDay() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
}

function getMonthLastDay() {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    today.setDate(0);
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

async function get(path: string): Promise<Response> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${
            path.startsWith("/") ? path : "/" + path
        }`,
        { credentials: "include" },
    );
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    return response;
}

async function getStats(
    statsEndpoint: string,
    start: Date,
    end: Date,
): Promise<Response> {
    return get(
        `/admin/stats/${statsEndpoint}?start=${start
            .toLocaleDateString()
            .split("/")
            .reverse()
            .join("-")}&end=${end
            .toLocaleDateString()
            .split("/")
            .reverse()
            .join("-")}`,
    );
}

interface LogoutResult {
    success: boolean;
    error: string;
}

export async function logout(): Promise<LogoutResult> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`,
            { credentials: "include" },
        );
        const jsonResponse = await response.json();
        if (jsonResponse.message === "LOGOUT_SUCCESSFUL") {
            return { success: true, error: "" };
        }
        throw new Error("Unknown error");
    } catch (error) {
        return { success: false, error: (error as Error).toString() };
    }
}

export async function getDayUniqueVisitors(): Promise<number> {
    const response = await getStats("unique-visitors", new Date(), new Date());
    return (await response.json())[
        new Date().toLocaleDateString().split("/").reverse().join("-")
    ];
}

export async function getDayUniqueHumanVisitors(): Promise<number> {
    const response = await getStats(
        "unique-human-visitors",
        new Date(),
        new Date(),
    );
    return (await response.json())[
        new Date().toLocaleDateString().split("/").reverse().join("-")
    ];
}

export async function getMonthUniqueHumanVisitors(): Promise<ApiUniqueHumanVisitors> {
    const response = await getStats(
        "unique-human-visitors",
        getMonthFirstDay(),
        getMonthLastDay(),
    );
    return await response.json();
}

export async function getMonthUniqueVisitors(): Promise<ApiUniqueVisitors> {
    const response = await getStats(
        "unique-visitors",
        getMonthFirstDay(),
        getMonthLastDay(),
    );
    return await response.json();
}

export async function getDayViews(): Promise<number> {
    const response = await getStats("views", new Date(), new Date());
    return (await response.json())[
        new Date().toLocaleDateString().split("/").reverse().join("-")
    ];
}

export async function getDayPlatforms(): Promise<ApiPlatforms> {
    const response = await getStats("platforms", new Date(), new Date());
    return await response.json();
}
