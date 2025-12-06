import type { Types } from "mongoose";

import { Course, CourseSchemaProperties } from "../models/course.model.js";

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

    /**
     * Find overlapping courses for a specific time range
     */
    async getOverlappingCourses(
        start: string,
        end: string,
    ): Promise<
        (CourseSchemaProperties & { _id: Types.ObjectId; __v: number })[]
    > {
        // Recherche de tous les cours qui débordent sur la période demandée selon 4 cas :
        //
        // CAS 1 : Le cours englobe complètement la période
        // Cours       |--------------------|
        // Demande         |-----------|
        //
        // CAS 2 : Le cours est englobé par la période
        // Cours           |-----------|
        // Demande     |--------------------|
        //
        // CAS 3 : Le cours chevauche le début de la période
        // Cours       |-----------|
        // Demande         |-----------|
        //
        // CAS 4 : Le cours chevauche la fin de la période
        // Cours           |-----------|
        // Demande     |-----------|
        //
        return await Course.find({
            $and: [
                { start: { $lt: end } }, // le cours commence avant la fin de la période demandée
                { end: { $gt: start } }, // le cours finit après le début de la période demandée
            ],
        }).lean();
    }
}

const coursesService = new CoursesService();

export { coursesService };
