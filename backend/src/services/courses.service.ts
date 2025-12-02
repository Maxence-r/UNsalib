import type { Types } from "mongoose";

import { Course, CourseSchemaProperties } from "../models/course.js";

class CoursesService {
    /**
     * Return the timetable for a specific room
     */
    async getTimetable(
        roomId: string,
        start: string,
        end: string,
    ): Promise<
        (CourseSchemaProperties & { _id: Types.ObjectId; __v: number })[]
    > {
        // Getting courses based on room id and given period
        return await Course.find({
            rooms: roomId, // the room is included in the course rooms array
            $and: [{ start: { $gte: start } }, { end: { $lte: end } }],
        }).lean();
    }
}

const coursesService = new CoursesService();

export { coursesService };
