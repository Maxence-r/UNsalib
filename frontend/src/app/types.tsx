export interface ApiRoomType {
    id: string,
    name: string,
    alias: string,
    building: string,
    available: boolean,
    features: string[]
};

export interface ApiCourseType {
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

export interface ApiWeekInfosType {
    end: string,
    number: string,
    start: string
};

export interface ApiCoursesResponseType {
    courses: ApiCourseType[],
    weekInfos: ApiWeekInfosType
};