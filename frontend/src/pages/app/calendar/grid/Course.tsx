import type { ApiDataCourse } from "../../../../utils/types/api.type.js";
import { CourseModal } from "../modals/CourseModal.js";
import "./Course.css";
import { DAY_DURATION, START_DAY_HOUR } from "../../../../utils/constants.js";
import { useModal } from "../../../../components/modal/Modal.js";

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

function Course({ course }: { course: ApiDataCourse }) {
    const courseDurationMinutes = getCourseDurationMinutes(
        course.start,
        course.end,
    );

    const { open: openCourseModal } = useModal(
        `course-${course.courseId}`,
        <CourseModal
            startDate={course.start}
            endDate={course.end}
            color={course.color}
            groups={course.groups}
            modules={course.modules}
            teachers={course.teachers}
        />,
    );

    const cutStart = new Date(course.start);
    if (cutStart.getHours() < START_DAY_HOUR) {
        cutStart.setHours(START_DAY_HOUR);
        cutStart.setMinutes(0);
    }

    let percentHeight = getCourseHeightPercent(
        DAY_DURATION * 60,
        courseDurationMinutes,
    );
    if (percentHeight > 100) percentHeight = 100;

    return (
        <div
            style={{
                top: `${getCourseAbsoluteTopPercent(DAY_DURATION * 60, cutStart, START_DAY_HOUR * 60)}%`,
                backgroundColor: course.color,
                color: course.onColor,
                height: `${percentHeight}%`,
                // width: `${100 / course.length}%`
                // width: "100%",
                // left:
                // TODO: handle concurrent courses
            }}
            className="course"
            onClick={openCourseModal}
        >
            <h2>{course.modules.length > 0 ? course.modules.join(" ; ") : "Non renseigné"}</h2>
            <p>
                {course.teachers.length > 0 ? course.teachers.join(" ; ") : ""}
            </p>
        </div>
    );
}

export { Course };
