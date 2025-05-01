import { ApiPlatforms, ApiUniqueVisitors, ApiViews } from "@/_utils/api-types";

interface LogoutResult {
    success: boolean, 
    error: string
}

export async function logout(): Promise<LogoutResult> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
            { credentials: "include" }
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

interface GetDayUniqueVisitorsResult {
    success: boolean,
    data: ApiUniqueVisitors,
    message: string
}

export async function getDayUniqueVisitors(): Promise<GetDayUniqueVisitorsResult> {
    try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/stats/unique-visitors?start=${today}&end=${today}`,
            { credentials: "include" }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const dayUniqueVisitors = await response.json();
        return {
            success: true,
            data: dayUniqueVisitors,
            message: ""
        };
    } catch (error) {
        return {
            success: false,
            data: {},
            message: error as string
        };
    }
}

interface GetDayViewsResult {
    success: boolean,
    data: ApiViews,
    message: string
}

export async function getDayViews(): Promise<GetDayViewsResult> {
    try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/stats/views?start=${today}&end=${today}`,
            { credentials: "include" }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const dayViews = await response.json();
        return {
            success: true,
            data: dayViews,
            message: ""
        };
    } catch (error) {
        return {
            success: false,
            data: {},
            message: error as string
        };
    }
}

interface GetDayPlatformsResult {
    success: boolean,
    data: ApiPlatforms,
    message: string
}

export async function getDayPlatforms(): Promise<GetDayPlatformsResult> {
    try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/stats/platforms?start=${today}&end=${today}`,
            { credentials: "include" }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const dayPlatforms = await response.json();
        return {
            success: true,
            data: dayPlatforms,
            message: ""
        };
    } catch (error) {
        return {
            success: false,
            data: {},
            message: error as string
        };
    }
}