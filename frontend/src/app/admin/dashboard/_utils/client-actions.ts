import { ApiPlatforms, ApiUniqueVisitors, ApiViews } from "@/_utils/api-types";

interface LogoutResult {
    success: boolean, 
    error: string
}

export async function logout(): Promise<LogoutResult> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`,
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

export async function getAnalytics(start: string, end: string, type: 'browsers' | 'devices' | 'platforms' | 'views' | 'unique-visitors') {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/stats/${type}?start=${start}&end=${end}`,
            { credentials: "include" }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data, message: "" };
    } catch (error) {
        return { success: false, data: {}, message: error as string };
    }
}

export async function getSystemHealth() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/system-health`,
            { credentials: "include" }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const health = await response.json();
        return { success: true, data: health, message: "" };
    } catch (error) {
        return { success: false, data: null, message: error as string };
    }
}

export async function getRoomsUsage(start: string, end: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/rooms-usage?start=${start}&end=${end}`,
            { credentials: "include" }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const usage = await response.json();
        return { success: true, data: usage, message: "" };
    } catch (error) {
        return { success: false, data: [], message: error as string };
    }
}

export async function getRooms() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/rooms`,
            { credentials: "include" }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const rooms = await response.json();
        return { success: true, data: rooms, message: "" };
    } catch (error) {
        return { success: false, data: [], message: error as string };
    }
}

export async function getCourses(start?: string, end?: string, limit?: number) {
    try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/courses?`;
        if (start) url += `start=${start}&`;
        if (end) url += `end=${end}&`;
        if (limit) url += `limit=${limit}`;
        
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const courses = await response.json();
        return { success: true, data: courses, message: "" };
    } catch (error) {
        return { success: false, data: [], message: error as string };
    }
}

export async function bulkUpdateRooms(roomIds: string[], updates: any) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/bulk-update-rooms`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ roomIds, updates })
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        return { success: true, data: result, message: "" };
    } catch (error) {
        return { success: false, data: null, message: error as string };
    }
}

export async function bulkDeleteCourses(courseIds: string[]) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/bulk-delete-courses`,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ courseIds })
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        return { success: true, data: result, message: "" };
    } catch (error) {
        return { success: false, data: null, message: error as string };
    }
}

export async function updateRoom(roomId: string, data: any) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/update-room`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ roomId, data })
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        return { success: true, data: result, message: "" };
    } catch (error) {
        return { success: false, data: null, message: error as string };
    }
}

export async function exportData(type: 'rooms' | 'courses' | 'stats', format: 'json' | 'csv', dateRange?: { start: string, end: string }) {
    try {
        let data: any = null;
        
        if (type === 'rooms') {
            const result = await getRooms();
            data = result.data;
        } else if (type === 'courses') {
            const result = await getCourses(dateRange?.start, dateRange?.end);
            data = result.data;
        } else if (type === 'stats' && dateRange) {
            const result = await getAnalytics(dateRange.start, dateRange.end, 'unique-visitors');
            data = result.data;
        }

        if (!data) {
            throw new Error('No data to export');
        }

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            // Convert to CSV
            const csvData = convertToCSV(data);
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        return { success: true, message: "Export successful" };
    } catch (error) {
        return { success: false, message: error as string };
    }
}

function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const keys = Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(item => {
        return keys.map(key => {
            const value = item[key];
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value;
        }).join(',');
    });
    
    return [header, ...rows].join('\n');
}