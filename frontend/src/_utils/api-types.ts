// Endpoint: /rooms

export interface ApiRoom {
    id: string,
    name: string,
    alias: string,
    building: string,
    available: boolean,
    features: ("visio" | "badge" | "video" | "ilot")[]
};

export type ApiRoomsList = ApiRoom[];

// Endpoint: /rooms/timetable

export interface ApiCourse {
    category: string,
    color: string,
    courseId: string,
    duration: number,
    end: string,
    groups: string[],
    modules: string[],
    notes: string,
    overflow: number,
    roomId: string[],
    start: string,
    teachers: string[]
};

export type ApiCourses = ApiCourse[];

export interface ApiWeekInfos {
    end: string,
    number: string,
    start: string
};

export interface ApiTimetable {
    courses: ApiCourses,
    weekInfos: ApiWeekInfos
};

// Endpoint: /admin/stats/unique-visitors

export interface ApiUniqueVisitors { 
    [key: string]: number
}

// Endpoint: /admin/stats/unique-human-visitors

export interface ApiUniqueHumanVisitors { 
    [key: string]: number
}

// Endpoint: /admin/stats/views

export interface ApiViews { 
    [key: string]: number
}

// Endpoint: /admin/stats/platforms

export interface ApiPlatforms { 
    [key: string]: {
        [key: string]: number
    }
}

export interface ApiStatsTotals {
    uniqueVisitors: number;
    uniqueHumanVisitors: number;
    views: number;
    roomRequests: number;
    availableRoomsRequests: number;
    internalErrors: number;
}

export interface ApiStatsDailyPoint extends ApiStatsTotals {
    date: string;
    label: string;
}

export interface ApiStatsMonthlyPoint extends ApiStatsTotals {
    month: number;
    label: string;
    activeDays: number;
}

export interface ApiStatsTrafficBreakdown {
    os: {
        [key: string]: number;
    };
    browsers: {
        [key: string]: number;
    };
}

export interface ApiAdminStatsOverview {
    selectedYear: number;
    selectedMonth: number;
    availableYears: number[];
    month: {
        label: string;
        activeDays: number;
        peakDay: ApiStatsDailyPoint | null;
        totals: ApiStatsTotals;
        dailyStats: ApiStatsDailyPoint[];
        platforms: ApiStatsTrafficBreakdown;
    };
    year: {
        totals: ApiStatsTotals;
        monthlyStats: ApiStatsMonthlyPoint[];
        peakMonth: ApiStatsMonthlyPoint | null;
    };
}

// API error

export interface ApiError {
    error: string
};
