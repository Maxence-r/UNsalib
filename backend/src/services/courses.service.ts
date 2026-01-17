import type { Types, HydratedDocument } from "mongoose";

import { Course, CourseSchemaProperties } from "../models/course.model.js";

class CoursesService {
    /**
     * Return the timetable for a specific room
     */
    async getTimetable(
        roomId: string,
        start: string,
        end: string,
    ): Promise<(CourseSchemaProperties & { _id: Types.ObjectId })[]> {
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
    ): Promise<(CourseSchemaProperties & { _id: Types.ObjectId })[]> {
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

    /**
     * Clear group references from courses
     */
    async clearGroupReferences(groupId: Types.ObjectId): Promise<void> {
        const courses = await Course.find({ groups: groupId });

        for (const course of courses) {
            if (course.groups.length === 1) {
                // If the group is the only one linked to the course, delete the course
                await course.deleteOne();
            } else {
                // Otherwise, just remove the group from the course
                course.groups = course.groups.filter((g) => g !== groupId);
                await course.save();
            }
        }
    }

    /**
     * Get course documents by room
     */
    async getCourseDocsByRoom(
        roomId: Types.ObjectId,
    ): Promise<HydratedDocument<CourseSchemaProperties>[]> {
        return await Course.find({ rooms: roomId });
    }
}

const coursesService = new CoursesService();

export { coursesService };
