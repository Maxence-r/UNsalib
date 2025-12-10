import { useState } from "react";
import { createPortal } from "react-dom";

import type { ApiCourse } from "../../../../utils/types/api.type.js";
import { CourseModal } from "../modals/CourseModal.js";
import { isLightColor, hexToRgb } from "../../../../utils/color.js";
import "./Course.css";
import { DAY_DURATION, START_DAY_HOUR } from "../../../../utils/constants.js";

function buildModuleNamesString(modules: string[], category: string): string {
    const moduleNames = modules.map((module) => module.split(" - ")[1]);

    if (moduleNames.length > 0) {
        return moduleNames.join(" ; ");
    } else if (category) {
        return category;
    } else {
        return "Non renseigné";
    }
}

function hoursToMinutes(date: Date) {
    let minutes = date.get;
}

function getCourseDurationMinutes(start: string, end: string): number {
    return (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;
}

function getCourseAbsoluteTopPercent(
    dayDurationMinutes: number,
    courseStartDate: Date,
    dayStartMinutes: number,
): number {
    const dayStartDate = new Date(
        courseStartDate.getFullYear(),
        courseStartDate.getMonth(),
        courseStartDate.getDate(),
    );
    dayStartDate.setMinutes(dayStartMinutes);

    const courseStartDifference =
        (courseStartDate.getTime() - dayStartDate.getTime()) / 1000 / 60;

    return (courseStartDifference * 100) / dayDurationMinutes;
}

function getCourseHeightPercent(
    dayDurationMinutes: number,
    courseDurationMinutes: number,
): number {
    return (courseDurationMinutes * 100) / dayDurationMinutes;
}

function Course({ course }: { course: ApiCourse }) {
    const [isCourseModalOpen, setIsCourseModalOpen] = useState<boolean>(false);

    const moduleNames = buildModuleNamesString(course.modules, course.category);
    const onColor = isLightColor(hexToRgb(course.color))
        ? "#000000"
        : "#ffffff";
    const courseDurationMinutes = getCourseDurationMinutes(
        course.start,
        course.end,
    );

    return (
        <div
            style={{
                top: `${getCourseAbsoluteTopPercent(DAY_DURATION * 60, new Date(course.start), START_DAY_HOUR * 60)}%`,
                backgroundColor: course.color,
                color: onColor,
                height: `${getCourseHeightPercent(DAY_DURATION * 60, courseDurationMinutes)}%`,
                // width: `${100 / course.length}%`
                // width: "100%",
                // left:
                // TODO: handle concurrent courses
            }}
            className="course"
            onClick={() => {
                setIsCourseModalOpen(true);
            }}
        >
            {createPortal(
                <CourseModal
                    isOpen={isCourseModalOpen}
                    setIsOpen={setIsCourseModalOpen}
                    startDate={course.start}
                    endDate={course.end}
                    color={course.color}
                    groups={course.groups}
                    moduleNamesString={moduleNames}
                    modules={course.modules}
                    teachers={course.teachers}
                />,
                document.body,
            )}
            <h2>{moduleNames}</h2>
            <p>
                {course.teachers.length > 0 ? course.teachers.join(" ; ") : ""}
            </p>
        </div>
    );
}

export { Course };
