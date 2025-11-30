// Endpoint: /rooms

export interface ApiRoom {
    id: string;
    name: string;
    alias: string;
    building: string;
    available: boolean;
    features: ("visio" | "badge" | "video" | "ilot")[];
}

export type ApiRoomsList = { success: boolean; data: ApiRoom[] };

// Endpoint: /rooms/timetable

export interface ApiCourse {
    category: string;
    color: string;
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
