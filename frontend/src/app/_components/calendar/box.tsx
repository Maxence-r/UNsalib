"use client";
import { useModalStore } from "@/_components/modal";
import { ApiCourseType } from "../../_utils/types";

function joinArrayElements(array: string[], separator: string, splitter: string, chooseBeforeSplit = false) {
    let string = '';
    array.forEach((element) => {
        if (splitter) {
            string += element.split(splitter)[chooseBeforeSplit ? 0 : 1] + ' ' + separator + ' ';
        } else {
            string += element + separator + ' ';
        }
    });
    string = string.substring(0, string.length - separator.length - 1);
    return string;
}

export default function CalendarBox({ hourCourses }: { hourCourses: ApiCourseType[] }) {
    const openModal = useModalStore((state) => state.open);
    const setModalContent = useModalStore((state) => state.setContent);

    return (
        <div className="content-box">
            {hourCourses.map(course => {
                let courseModule: string;
                if (course.modules.length > 0) {
                    courseModule = joinArrayElements(course.modules, ';', ' - ') == '' ? 'Cours inconnu' : joinArrayElements(course.modules, ';', ' - ');
                } else if (course.category) {
                    courseModule = course.category;
                } else {
                    courseModule = "Cours inconnu";
                }
                const teacher = course.teachers.length > 0 ? course.teachers.join(' ; ') : '';
                const startDate: Date = new Date(course.start);
                const endDate: Date = new Date(course.end);
                const durationHours = endDate.getHours() - startDate.getHours() > 0 ? endDate.getHours() - startDate.getHours() + "h" : "";
                let durationMinutes = endDate.getMinutes() - startDate.getMinutes() > 0 ? endDate.getMinutes() - startDate.getMinutes() + "min" : "";
                durationMinutes = durationHours == "" && durationMinutes == "" ? "0min" : durationMinutes;

                return (
                    <div
                        key={course.courseId}
                        style={{
                            top: `${course.overflow}%`,
                            backgroundColor: course.color,
                            height: `calc(${course.duration}% + ${(course.duration > 100 ? Math.floor(course.duration / 100) * 2 : 0)}px)`,
                            // width: `${100 / course.length}%`
                            width: "100%"
                            // left:
                            // TODO: handle concurrent courses
                        }}
                        className="course"
                        onClick={() => {
                            setModalContent(
                                <div className="course-details">
                                    <div className="course-box">
                                        <p className="course-start">{startDate.getHours() + ":" + (startDate.getMinutes().toString().length == 2 ? startDate.getMinutes() : "0" + startDate.getMinutes())}</p>
                                        <div className="course-container" style={{ backgroundColor: course.color }}>
                                            <p>{courseModule}</p>
                                        </div>
                                        <p className="course-end">{endDate.getHours() + ":" + (endDate.getMinutes().toString().length == 2 ? endDate.getMinutes() : "0" + endDate.getMinutes())}</p>
                                    </div>
                                    <div className="detail">
                                        <h2>Enseignant(e)(s) :</h2>
                                        <p id="teacher-name">{teacher == '' ? 'Non renseigné' : teacher}</p>
                                    </div>
                                    <div className="detail">
                                        <h2>Module :</h2>
                                        <p id="module">{course.modules.length > 0 ? joinArrayElements(course.modules, ';', ' - ', true) : 'Inconnu'}</p>
                                    </div>
                                    <div className="detail">
                                        <h2>Durée :</h2>
                                        <p id="duration">{durationHours + durationMinutes}</p>
                                    </div>
                                    <div className="detail">
                                        <h2>Groupe(s) :</h2>
                                        <p id="groupes">{course.groups.join(' ; ') == '' ? 'Non renseigné' : course.groups.join(' ; ')}</p>
                                    </div>
                                </div>
                            );
                            openModal();
                        }}
                    >
                        <h2>{courseModule}</h2>
                        <p>{teacher}</p>
                    </div>
                );
            })}
        </div>
    )
}