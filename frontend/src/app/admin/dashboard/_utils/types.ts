export interface ApiUserAccount {
    icon: string,
    lastname: string,
    name: string,
    username: string
}

export interface ApiRoom {
    id: string,
    name: string,
    alias?: string,
    building: string,
    banned: boolean,
    type: string,
    seats?: number,
    boards?: {
        white: number,
        black: number,
        display: number
    },
    features?: string[]
}

export interface ApiCourse {
    id: string,
    univId: string,
    celcatId: string,
    category?: string,
    start: string,
    end: string,
    notes?: string,
    color?: string,
    rooms: string[],
    teachers: string[],
    groups: string[],
    modules: string[]
}

export interface ApiSystemHealth {
    status: 'healthy' | 'degraded' | 'down',
    database: boolean,
    lastUpdate: string,
    roomsCount: number,
    coursesCount: number,
    usersCount: number
}

export interface ApiAnalyticsBrowsers {
    [date: string]: {
        [browser: string]: number
    }
}

export interface ApiAnalyticsDevices {
    [date: string]: {
        desktop: number,
        mobile: number,
        tablet: number,
        bot: number
    }
}

export type ApiAnalyticsTrend = {
    date: string,
    value: number
}[]

export interface ApiRoomUsage {
    roomId: string,
    roomName: string,
    courseCount: number,
    totalHours: number
}

export interface ApiBulkOperationResult {
    success: boolean,
    modified: number,
    failed: number,
    errors?: string[]
}