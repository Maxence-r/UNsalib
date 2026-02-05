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

    /**
     * Get course documents associated with a group and included
     * in a specified range
     */
    async getCourseDocsByGroupAndRange(
        start: Date,
        end: Date,
        groupId: Types.ObjectId,
    ): Promise<HydratedDocument<CourseSchemaProperties>[]> {
        return await Course.find({
            start: { $gte: start },
            end: { $lte: end },
            groups: groupId,
        });
    }

    /**
     * Search a course and return its ID if found, null otherwise
     */
    async findCourseId(
        univId: number,
        start: Date,
        end: Date,
        rooms: Types.ObjectId[],
        teachers: string[],
        modules: string[],
        category?: string,
    ): Promise<null | Types.ObjectId> {
        const course = await Course.findOne({
            univId: univId,
            start: start,
            end: end,
            ...(category && { category: category }),
            ...(rooms
                ? {
                      $all: rooms, // only check that all the elements of rooms are present
                      $size: rooms.length, // so we need to also check the array size
                      // If it contains exactly all the rooms then it's the same array
                  }
                : []),
            ...(teachers
                ? {
                      $all: teachers,
                      $size: teachers.length,
                  }
                : []),
            ...(modules
                ? {
                      $all: modules,
                      $size: modules.length,
                  }
                : []),
        });

        return course ? course._id : null;
    }

    /**
     * Add a group to a course
     */
    async addGroupToCourse(
        courseId: Types.ObjectId,
        groupId: Types.ObjectId,
    ): Promise<void> {
        await Course.updateOne(
            { _id: courseId },
            {
                $push: { groups: groupId },
            },
        );
    }

    /**
     * Add a course
     */
    async addCourse(
        univId: number,
        celcatId: string,
        start: Date,
        end: Date,
        color: string,
        rooms: Types.ObjectId[],
        teachers: string[],
        modules: string[],
        groupId: Types.ObjectId,
        category?: string,
    ): Promise<void> {
        await new Course({
            univId: univId,
            celcatId: celcatId,
            start: start,
            end: end,
            color: color,
            rooms: rooms,
            teachers: teachers,
            groups: [groupId],
            modules: modules,
            ...(category && { category: category }),
        }).save();
    }

    /**
     * Delete a course
     */
    async deleteCourse(id: Types.ObjectId): Promise<void> {
        await Course.deleteOne({ _id: id });
    }
}

const coursesService = new CoursesService();

export { coursesService };
