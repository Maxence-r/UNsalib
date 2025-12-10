interface Api {
    success: boolean;
    data: unknown;
}

// Endpoint: /rooms

interface ApiRoom {
    id: string;
    name: string;
    building: string;
    features: ("visio" | "badge" | "video" | "ilot")[];
};

// Endpoint: /rooms/timetable

export interface ApiCourse {
    category: string;
    color: string;
    onColor: string;
    courseId: string;
    duration: number;
    end: string;
    groups: string[];
    modules: string[];
    notes: string;
    overflow: number;
    roomId: string[];
    start: string;
    teachers: string[];
}

export type ApiCourses = ApiCourse[];

export interface ApiWeekInfos {
    end: string;
    number: number;
    start: string;
}

export interface ApiTimetable {
    success: boolean;
    data: {
        courses: ApiCourses;
        weekInfos: ApiWeekInfos;
    };
}

// Endpoint: /admin/stats/unique-visitors

export interface ApiUniqueVisitors {
    [key: string]: number;
}

// Endpoint: /admin/stats/unique-human-visitors

export interface ApiUniqueHumanVisitors {
    [key: string]: number;
}

// Endpoint: /admin/stats/views

export interface ApiViews {
    [key: string]: number;
}

// Endpoint: /admin/stats/platforms

export interface ApiPlatforms {
    [key: string]: {
        [key: string]: number;
    };
}

// API error

export interface ApiError {
    error: string;
}

export type { Api, ApiRoom };
