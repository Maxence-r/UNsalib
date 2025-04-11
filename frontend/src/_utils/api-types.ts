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

// Endpoints: /admin/stats/unique-visitors

export interface ApiUniqueVisitors { 
    [key: string]: number 
}

// Endpoints: /admin/stats/views

export interface ApiViews { 
    [key: string]: number 
}

// API error

export interface ApiError {
    error: string
};