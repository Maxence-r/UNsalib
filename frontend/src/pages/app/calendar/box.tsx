import { useState } from "react";
import { createPortal } from "react-dom";

import type { ApiCourses } from "../../../utils/api-types.js";
import { CourseModal } from "./modals/CourseModal.js";

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

export default function CalendarBox({
    hourCourses,
}: {
    hourCourses: ApiCourses;
}) {
    const [isCourseModalOpen, setIsCourseModalOpen] = useState<boolean>(false);

    return (
        <div className="content-box">
            {hourCourses.map((course) => {
                const moduleNames = buildModuleNamesString(
                    course.modules,
                    course.category,
                );

                return (
                    <div
                        key={course.courseId}
                        style={{
                            top: `${course.overflow}%`,
                            backgroundColor: course.color,
                            height: `calc(${course.duration}% + ${course.duration > 100 ? Math.floor(course.duration / 100) * 2 : 0}px)`,
                            // width: `${100 / course.length}%`
                            width: "100%",
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
                            {course.teachers.length > 0
                                ? course.teachers.join(" ; ")
                                : ""}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
