import "./Grid.css";

import { DAY_DURATION, START_DAY_HOUR } from "../../../../utils/constants";
import type { ApiDataCourse } from "../../../../utils/types/api.type";
import { Column, ColumnHeader } from "./Column";

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

// const courses = [
//     {
//         courseId: "68ca932df8aadb34e88f42d3",
//         start: "2025-12-10T11:00:00+01:00",
//         end: "2025-12-10T12:20:00+01:00",
//         notes: "0,40,0,0",
//         category: "CTDI math",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["CARRON DIT L AVOCAT Gilles"],
//         modules: ["XLG1ME050 - Mathematiques pour la Chimie"],
//         groups: ["L1", "L1CHIMIE", "L1CHIMIE-BIO", "146", "146C", "146D"],
//         color: "#f1c40f",
//     },
//     {
//         courseId: "68ca94aff8aadb34e88feeda",
//         start: "2025-12-08T09:30:00+01:00",
//         end: "2025-12-08T10:50:00+01:00",
//         notes: "Electricité\r\nsalle à 36 places",
//         category: "CTDI phys",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["GUIFFARD Benoit"],
//         modules: ["XLG1PE020 - Electricite et outils math associes"],
//         groups: [
//             "L1",
//             "L1CMI",
//             "L1MATHS",
//             "L1PHY-MATHS",
//             "L1PHYSIQUE",
//             "154CMI",
//             "154S",
//             "154T",
//             "159",
//             "159C",
//             "159D",
//             "173",
//             "173A",
//             "173B",
//             "175CMI",
//             "175E",
//             "175F",
//         ],
//         color: "#3498db",
//     },
//     {
//         courseId: "68ca967ef8aadb34e890982b",
//         start: "2025-12-10T09:30:00+01:00",
//         end: "2025-12-10T10:50:00+01:00",
//         notes: "8-32-0-0",
//         category: "CTDI phys",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: [],
//         modules: ["XLG1PE010 - Mecanique du point 1 et outils math associes"],
//         groups: ["L1", "L1PEIP", "L1PHYSIQUE", "169PEIP", "169S", "169T"],
//         color: "#3498db",
//     },
//     {
//         courseId: "68caa575f8aadb34e898357b",
//         start: "2025-12-12T09:30:00+01:00",
//         end: "2025-12-12T10:50:00+01:00",
//         notes: "30h66-0-9h34-0",
//         category: "TD sv",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["CARIO-TOUMANIANTZ Chrystelle"],
//         modules: [
//             "XLG5BU080 - Des interactions cellul à la physiologie intégrée",
//         ],
//         groups: [
//             "510ABT",
//             "510BCPA",
//             "510U",
//             "512Y",
//             "512Z",
//             "L3",
//             "L3ABT",
//             "L3BCVA",
//             "L3SV",
//             "512BVA",
//             "913-510B",
//         ],
//         color: "#3498db",
//     },
//     {
//         courseId: "68d15b8096e762326145848e",
//         start: "2025-12-10T14:00:00+01:00",
//         end: "2025-12-10T15:20:00+01:00",
//         notes: "",
//         category: "CTDI math",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["BRISSON Paul"],
//         modules: ["XLG1ME010 - Mathematiques generales"],
//         groups: ["L1", "L1PHY-MATHS", "L1PHYSIQUE", "158", "158A", "158B"],
//         color: "#f1c40f",
//     },
//     {
//         courseId: "68e4010e96e7623261bf0e8b",
//         start: "2025-12-08T14:00:00+01:00",
//         end: "2025-12-08T15:20:00+01:00",
//         notes: "",
//         category: "CTDI math",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["LE BORGNE Florent"],
//         modules: ["XLG1ME010 - Mathematiques generales"],
//         groups: ["L1", "L1LAS", "L1MATHS", "179LAS", "179M", "179N"],
//         color: "#f1c40f",
//     },
//     {
//         courseId: "6915a6dcc1a876d111793533",
//         start: "2025-12-08T17:00:00+01:00",
//         end: "2025-12-08T18:20:00+01:00",
//         notes: "20-0-12-8",
//         category: "TD chimie",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["RENAULT Steven"],
//         modules: ["XLG3CU130 - Chimie environnementale"],
//         groups: ["L2", "L2BE", "L2SVT", "326", "326M", "326N"],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "6915a98475f52aedf7953bb3",
//         start: "2025-12-11T14:00:00+01:00",
//         end: "2025-12-11T15:20:00+01:00",
//         notes: "",
//         category: "CTDI chimie",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["RENAULT Steven"],
//         modules: ["XLG1CE010 - Chimie Atome Liaison Molecule"],
//         groups: ["L1", "L1SV", "102", "102E", "102F"],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "6915aa7275f52aedf795c6fd",
//         start: "2025-12-12T11:00:00+01:00",
//         end: "2025-12-12T12:20:00+01:00",
//         notes: "",
//         category: "CTDI chimie",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["GENRE-GRANDPIERRE Evelyne"],
//         modules: ["XLG1CE010 - Chimie Atome Liaison Molecule"],
//         groups: ["L1", "L1SV", "109", "109S", "109T"],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "6915ad5675f52aedf797382c",
//         start: "2025-12-08T11:00:00+01:00",
//         end: "2025-12-08T12:20:00+01:00",
//         notes: "Electricité",
//         category: "CTDI phys",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["HAREL Sylvie"],
//         modules: ["XLG1PE020 - Electricite et outils math associes"],
//         groups: ["L1", "L1PHYSIQUE", "151", "151M", "151N"],
//         color: "#3498db",
//     },
//     {
//         courseId: "6915ae0f75f52aedf7979461",
//         start: "2025-12-10T15:30:00+01:00",
//         end: "2025-12-10T16:50:00+01:00",
//         notes: "",
//         category: "CTDI math",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["BRISSON Paul"],
//         modules: ["XLG1ME010 - Mathematiques generales"],
//         groups: ["L1", "L1SPI", "157SPI", "157Y", "157Z"],
//         color: "#f1c40f",
//     },
//     {
//         courseId: "691f21fa75f52aedf76627c8",
//         start: "2025-12-11T11:00:00+01:00",
//         end: "2025-12-11T12:20:00+01:00",
//         notes: "8-0-12-0",
//         category: "TD chimie",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["HERNANDEZ Olivier"],
//         modules: ["XLG5CU010 - Chimie de coordination"],
//         groups: [
//             "540",
//             "540A",
//             "540B",
//             "547",
//             "547O",
//             "547P",
//             "L3",
//             "L3CH-AVANCEE",
//             "L3CHIMIE",
//             "L3CH-PH",
//         ],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "691f22ac75f52aedf766581a",
//         start: "2025-12-11T08:00:00+01:00",
//         end: "2025-12-11T09:20:00+01:00",
//         notes: "9H33-0-8-0",
//         category: "TD chimie",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["ISHOW Elena"],
//         modules: ["XLG5CE132 - Physico chimie organique"],
//         groups: ["547", "547O", "547P", "L3", "L3CHIMIE", "L3CH-PH"],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "691f22ac75f52aedf766581e",
//         start: "2025-12-11T09:30:00+01:00",
//         end: "2025-12-11T10:50:00+01:00",
//         notes: "9H33-0-8-0",
//         category: "TD chimie",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["ISHOW Elena"],
//         modules: ["XLG5CE132 - Physico chimie organique"],
//         groups: ["547", "547O", "547P", "L3", "L3CHIMIE", "L3CH-PH"],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "692eba9c75f52aedf7a0d7b0",
//         start: "2025-12-09T14:00:00+01:00",
//         end: "2025-12-09T15:20:00+01:00",
//         notes: "0-20-0-0",
//         category: "CTDI phys",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["MATTIOLI Kara"],
//         modules: ["XLG1PE812 - Interactions rayonnements / matière"],
//         groups: ["L1", "L1SV", "110", "110U", "110V"],
//         color: "#3498db",
//     },
//     {
//         courseId: "692f28b375f52aedf7ccdc7e",
//         start: "2025-12-10T12:30:00+01:00",
//         end: "2025-12-10T13:50:00+01:00",
//         notes: "Electricité",
//         category: "CTDI phys",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["FERNANDEZ Marie Claude"],
//         modules: ["XLG1PE020 - Electricite et outils math associes"],
//         groups: ["L1", "L1PHY-MATHS", "L1PHYSIQUE", "158", "158A", "158B"],
//         color: "#3498db",
//     },
//     {
//         courseId: "693031ac75f52aedf738fbe9",
//         start: "2025-12-09T11:00:00+01:00",
//         end: "2025-12-09T12:20:00+01:00",
//         notes: "Electricité",
//         category: "CTDI phys",
//         duration: 133.33333333333331,
//         overflow: 0,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["EL GIBARI Mohammed"],
//         modules: ["XLG1PE020 - Electricite et outils math associes"],
//         groups: ["L1", "L1SPI", "157SPI", "157Y", "157Z"],
//         color: "#3498db",
//     },
//     {
//         courseId: "6931a0d875f52aedf7cdec94",
//         start: "2025-12-09T09:30:00+01:00",
//         end: "2025-12-09T10:50:00+01:00",
//         notes: "13H33-0-9H34-0",
//         category: "TD sv",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["ROLLAND Laetitia"],
//         modules: ["XLG5BE021 - Immunologie 2"],
//         groups: ["500", "500A", "500B", "L3", "L3BCM", "L3SV"],
//         color: "#3498db",
//     },
//     {
//         courseId: "6932ffcc75f52aedf75aad0b",
//         start: "2025-12-11T15:30:00+01:00",
//         end: "2025-12-11T17:30:00+01:00",
//         notes: "algorithmique\r\nrattrapage CC",
//         category: "Contrôle continu",
//         duration: 200,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["JERMANN Christophe"],
//         modules: [],
//         groups: ["CC", "M1", "M1MEEF", "M1MEEF-INFO"],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "69332ca975f52aedf76d767e",
//         start: "2025-12-09T15:30:00+01:00",
//         end: "2025-12-09T16:50:00+01:00",
//         notes: "",
//         category: "CTDI chimie",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["BLOT Virginie"],
//         modules: ["XLG1CE010 - Chimie Atome Liaison Molecule"],
//         groups: [
//             "L1",
//             "L1GEOSCIENCES",
//             "L1SVT",
//             "125",
//             "125Y",
//             "125Z",
//             "136",
//             "136C",
//             "136D",
//         ],
//         color: "#e74c3c",
//     },
//     {
//         courseId: "6936a80a75f52aedf7d19ac2",
//         start: "2025-12-09T12:30:00+01:00",
//         end: "2025-12-09T13:50:00+01:00",
//         notes: "Electricité",
//         category: "CTDI phys",
//         duration: 133.33333333333331,
//         overflow: 50,
//         roomId: ["673a611eba6deb0e792cd9cc"],
//         teachers: ["ETTOURI Rim"],
//         modules: ["XLG1PE020 - Electricite et outils math associes"],
//         groups: ["L1", "L1INFO", "181PA", "181Q", "181R"],
//         color: "#3498db",
//     },
// ];

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

function Grid({
    courses,
    weekStart,
    weekEnd,
}: {
    courses: ApiDataCourse[] | null;
    weekStart: Date | null;
    weekEnd: Date | null;
}) {
    const orderedCourses: ApiDataCourse[][] =
        courses && weekStart && weekEnd
            ? orderCoursesByDay(courses, weekStart, weekEnd).filter(
                  (_val, i) => i < VISIBLE_DAYS,
              )
            : [];

    return (
        <div className="calendar">
            <div className="column hours">
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
                        ? orderedCourses.map((_val, i) => (
                              <ColumnHeader
                                  dayDate={weekStart.getDate() + i}
                                  dayName={DAY_NAMES[i]}
                                  key={`header-${weekStart.getDate() + i}`}
                              />
                          ))
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
                                <div key={`cell-${i}`} className="cell" />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Grid };
