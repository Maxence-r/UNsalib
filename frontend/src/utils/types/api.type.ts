interface Api {
    success: boolean;
}

interface ApiSuccess extends Api {
    data: unknown;
}

interface ApiError extends Api {
    message: string;
}

// Endpoint: /rooms

interface ApiDataRoom {
    id: string;
    name: string;
    building: string;
    features: ("visio" | "badge" | "video" | "ilot")[];
}

// Endpoint: /rooms/timetable

interface ApiDataCourse {
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

interface ApiDataTimetable {
    courses: ApiDataCourse[];
    weekInfos: {
        end: string;
        number: number;
        start: string;
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

interface ApiDataAccount {
    icon: string;
    lastname: string;
    name: string;
    username: string;
}

// API error

// export interface ApiError {
//     error: string;
// }

export type {
    Api,
    ApiDataRoom,
    ApiError,
    ApiSuccess,
    ApiDataTimetable,
    ApiDataCourse,
    ApiDataAccount,
};
