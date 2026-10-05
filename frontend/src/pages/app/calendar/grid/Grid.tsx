import type { ReactElement } from "react";
import { useParams } from "react-router";

import "./Grid.css";
import { DAY_DURATION, START_DAY_HOUR } from "../../../../utils/constants";
import type {
    ApiDataCourse,
    ApiDataTimetable,
} from "../../../../utils/types/api.type";
import { Column, ColumnHeader } from "./Column";
import { useApi } from "../../../../utils/hooks/api.hook";
import { getRoomTimetable } from "../../../../api/timetables.api";

const DAY_NAMES = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
];

const VISIBLE_DAYS = 5;

function getDifferenceInDays(d1: Date, d2: Date): number {
    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());

    const differenceInDays =
        (d2.getTime() - d1.getTime()) / 1000 / 60 / 60 / 24;
    return differenceInDays > 0 ? differenceInDays : -1 * differenceInDays;
}

function orderCoursesByDay(
    courses: ApiDataCourse[],
    weekStart: Date,
    weekEnd: Date,
): ApiDataCourse[][] {
    // Start and end day included
    const nbDays = getDifferenceInDays(weekEnd, weekStart) + 1;

    const coursesByDay: ApiDataCourse[][] = [];

    for (let i = 0; i < nbDays; i++) coursesByDay.push([]);

    courses.forEach((course) => {
        coursesByDay[
            getDifferenceInDays(new Date(course.start), weekStart)
        ].push(course);
    });

    return coursesByDay;
}

// function computeHourIndicator() {
//     const dateActuelle = new Date();
//     const jourActuel = dateActuelle.getDay();
//     const heureActuelle = dateActuelle.getHours();
//     const minuteActuelle = dateActuelle.getMinutes();
//     if (
//         heureActuelle >= START_DAY_HOUR &&
//         heureActuelle < END_DAY_HOUR &&
//         jourActuel > 0 &&
//         jourActuel <= WEEK_DAYS.length
//     ) {
//         const top =
//             (100 * (heureActuelle - START_DAY_HOUR)) / DAY_DURATION +
//             (100 / DAY_DURATION) * (minuteActuelle / 60);
//         return {
//             value:
//                 heureActuelle +
//                 ":" +
//                 (minuteActuelle.toString().length == 2
//                     ? minuteActuelle
//                     : "0" + minuteActuelle),
//             top: top.toString(),
//             display: true,
//         };
//     } else {
//         return { value: "", top: "", display: false };
//     }
// }

function Grid(): ReactElement {
    const params = useParams<"roomId" | "weekNumber">();
    const roomId = params.roomId!;
    // TODO: check that weekNumber is legal
    const weekNumber = parseInt(params.weekNumber!);

    const { isLoading, data, error } = useApi<ApiDataTimetable | null>(
        () => getRoomTimetable(roomId, weekNumber),
        [params.roomId, params.weekNumber],
    );

    const weekStart = data ? new Date(data.weekInfos.start) : undefined;
    const weekEnd = data ? new Date(data.weekInfos.end) : undefined;
    const courses = data?.courses;

    const orderedCourses: ApiDataCourse[][] =
        courses && weekStart && weekEnd
            ? orderCoursesByDay(courses, weekStart, weekEnd).filter(
                  (_val, i) => i < VISIBLE_DAYS,
              )
            : [];

    return (
        <>
            {isLoading && (
                <div className="loader-indicator">
                    <span className="spin"></span>
                    <p>Chargement de l&apos;EDT...</p>
                </div>
            )}
            <div className="hours-column">
                <span className="placeholder">&nbsp;</span>
                {[...Array(DAY_DURATION)].map((_val, i) => (
                    <span key={`hour-${i}`}>{START_DAY_HOUR + i + ":00"}</span>
                ))}
                {/* <div
                        className="indicator-hour"
                        style={{
                            display: displayHourIndicator ? "flex" : "none",
                            top: hourIndicatorTop + "%",
                        }}
                    >
                        <span className="bubble">{hourIndicatorValue}</span>
                        <div className="bar"></div>
                    </div> */}
                {/* </div> */}
            </div>
            <div className="grid">
                <div
                    className="headers"
                    style={{
                        gridTemplateColumns: `repeat(${VISIBLE_DAYS}, 1fr)`,
                    }}
                >
                    {orderedCourses.length > 0 && weekStart && weekEnd
                        ? orderedCourses.map((_val, i) => {
                              const dayNumber = structuredClone(weekStart);
                              dayNumber.setDate(weekStart.getDate() + i);
                              return (
                                  <ColumnHeader
                                      dayDate={dayNumber.getDate()}
                                      dayName={DAY_NAMES[i]}
                                      key={`header-${dayNumber.getDate()}`}
                                  />
                              );
                          })
                        : [...Array(VISIBLE_DAYS)].map((_val, i) => (
                              <ColumnHeader key={`header-${i}`} />
                          ))}
                </div>
                <div className="columns">
                    {orderedCourses.map((dayCourses, i) => (
                        <Column key={`column-${i}`} dayCourses={dayCourses} />
                    ))}
                    <div
                        className="grid-pattern"
                        style={{
                            gridTemplateColumns: `repeat(${VISIBLE_DAYS}, 1fr)`,
                            gridTemplateRows: `repeat(${DAY_DURATION}, 1fr)`,
                        }}
                    >
                        {[...Array(VISIBLE_DAYS * DAY_DURATION)].map(
                            (_val, i) => (
                                <div
                                    key={`cell-${i}`}
                                    className="cell"
                                    style={{
                                        ...(i % VISIBLE_DAYS === 0 && {
                                            borderLeft: "none",
                                        }),
                                        ...(i % VISIBLE_DAYS ===
                                            VISIBLE_DAYS - 1 && {
                                            borderRight: "none",
                                        }),
                                        ...(i >=
                                            VISIBLE_DAYS *
                                                (DAY_DURATION - 1) && {
                                            borderBottom: "none",
                                        }),
                                    }}
                                />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export { Grid };
