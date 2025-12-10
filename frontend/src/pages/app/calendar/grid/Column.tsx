import "./Column.css";
import { Course } from "./Course";
import type { ApiCourse } from "../../../../utils/types/api.type";

function ColumnHeader({
    dayDate,
    dayName,
}: {
    dayDate?: number;
    dayName?: string;
}) {
    return (
        <div className="header">
            {dayName ?? "--"}
            {dayDate && <span className="day-number">{dayDate}</span>}
        </div>
    );
}

function Column({ dayCourses }: { dayCourses: ApiCourse[] }) {
    return (
        <div className="column">
            {dayCourses.map((course, i) => (
                <Course key={i} course={course} />
            ))}
        </div>
    );
}

export { Column, ColumnHeader };
