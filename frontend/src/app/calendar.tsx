"use client";
import { useState, useEffect, useContext } from "react";
import { SelectedRoomContext, LoadingTimetableContext } from "./contexts";
import { ApiCoursesResponseType, ApiCourseType } from "./types";

const START_DAY_HOUR = 8;
const END_DAY_HOUR = 19;
const DAY_DURATION = END_DAY_HOUR - START_DAY_HOUR;
const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

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

function CalendarBox({ hourCourses }: { hourCourses: ApiCourseType[] }) {
    return (
        <div className="content-box">
            {hourCourses.map(course => {
                let courseModule: string;
                if (course.modules.length > 0) {
                    courseModule = joinArrayElements(course.modules, ';', ' - ') == '' ? 'Cours inconnu' : joinArrayElements(course.modules, ';', ' - ');;
                } else if (course.category) {
                    courseModule = course.category;
                } else {
                    courseModule = "Cours inconnu";
                }
                let courseTeacher = course.teachers.length > 0 ? course.teachers.join(' ; ') : '';
                return (
                    <div
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
                    >
                        <h2>{courseModule}</h2>
                        <p>{courseTeacher}</p>
                    </div>
                );
            })}
        </div>
    )
}

function CalendarColumn({ dayName, dayNumber, dayCourses }: { dayName: string, dayNumber: string, dayCourses: ApiCourseType[] }) {
    interface HourType {
        hour: string,
        courses: ApiCourseType[]
    };

    const currentDayHours: HourType[] = [];
    for (let i = START_DAY_HOUR; i < END_DAY_HOUR; i++) {
        currentDayHours.push({
            hour: (i < 10 ? "0" + i : i).toString(),
            courses: []
        })
    }

    dayCourses.forEach(course => {
        currentDayHours.forEach((hour, i) => {
            if (course.start.split("T")[1].startsWith(hour.hour)) {
                hour.courses.push(course);
                return;
            }
        });
    });

    return (
        <div className="column">
            <div className="calendar-top">
                <p>{dayName}<span className="day">{" " + dayNumber}</span></p>
            </div>
            <div className="column-content">
                {currentDayHours.map(dayHour => <CalendarBox key={dayHour.hour} hourCourses={dayHour.courses}></CalendarBox>)}
            </div>
        </div>
    )
}

function CalendarContainer({ courses }: { courses: ApiCoursesResponseType }) {
    const dayHours = [];
    for (let i = 1; i < DAY_DURATION; i++) {
        dayHours.push(<p key={i}>{START_DAY_HOUR + i + ":00"}</p>)
    }

    interface DayType {
        name: string,
        number: string,
        date: string,
        courses: ApiCourseType[]
    };

    const currentWeekDays: DayType[] = [];
    const currentWeekStartDay: number = new Date(courses.weekInfos.start).getDate() || -1;
    
    WEEK_DAYS.forEach((dayName, i) => {
        let dayNumber: string = "--";
        if (currentWeekStartDay != -1) {
            dayNumber = ((currentWeekStartDay + i) < 10 ? "0" + (currentWeekStartDay + i) : (currentWeekStartDay + i)).toString();
        }
        currentWeekDays.push({
            name: dayName,
            number: dayNumber,
            date: courses.weekInfos.start.substring(0, courses.weekInfos.start.length - 2) + dayNumber,
            courses: []
        });
    });

    courses.courses.forEach(course => {
        currentWeekDays.forEach((day, i) => {
            if (course.start.startsWith(day.date)) {
                day.courses.push(course);
                return;
            }
        });
    });

    return (
        <div className="calendar-container">
            <div className="calendar-hours">
                <div className="calendar-top"></div>
                <div className="calendar-hours-display">
                    {dayHours}
                    <div className="indicator-hour"></div>
                </div>
            </div>
            <div className="calendar-columns">
                {currentWeekDays.map(currentDay => <CalendarColumn key={currentDay.name} dayName={currentDay.name} dayNumber={currentDay.number} dayCourses={currentDay.courses}></CalendarColumn>)}
            </div>
            <div tabIndex={-1} className="about">
                <h2>À PROPOS<img src="/arrow.svg" /></h2>
                <div className="about-content">
                    <div className="links">
                        <div className="link whitePaper">
                            <div className="link-infos">
                                <h2>WhitePaper</h2>
                                <p>Document de nos recherches</p>
                            </div>
                            <button tabIndex={-1}>
                                <img src="/download.svg" alt="Download" />
                            </button>
                        </div>
                    </div>
                    <div className="links profile">
                        <div className="link">
                            <div className="link-infos">
                                <h2>Maxence.R</h2>
                                <p>Développeur</p>
                            </div>
                            <img src="/maxence.png" />
                        </div>
                        <div className="link ">
                            <div className="link-infos">
                                <h2>Mael.B</h2>
                                <p>Développeur</p>
                            </div>
                            <img src="/profile.png" />
                        </div>
                        <div className="link">
                            <div className="link-infos">
                                <h2>Ethann.A</h2>
                                <p>Testeur</p>
                            </div>
                            <img src="/profile.png" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Calendar() {
    const { selectedRoomId, setSelectedRoomId } = useContext(SelectedRoomContext);
    const { loadingTimetable, setLoadingTimetable } = useContext(LoadingTimetableContext);
    const [courses, setCourses] = useState({
        "courses": [],
        "weekInfos": {
            "start": "--",
            "end": "--",
            "number": "--"
        }
    });

    useEffect(() => {
        async function render() {
            setLoadingTimetable(true);
            try {
                const response = await fetch(
                    `http://localhost:9000/api/rooms/timetable/?id=${selectedRoomId}&increment=${1}`
                );
                const coursesData = await response.json();
                setCourses(coursesData);
            } finally {
                setLoadingTimetable(false);
            }
        }

        if (selectedRoomId != "") {
            render();
        }
    }, [selectedRoomId]);

    return (
        <div className="calendar">
            <div className="loader-indicator" style={{ display: loadingTimetable ? "flex" : "none" }}>
                <span className="spin"></span>
                <p>Chargement de l'EDT...</p>
            </div>
            <div className="calendar-header">
                <div className="week-switcher">
                    <img src="/chevrons-left.svg" alt="previous" />
                    <p>SEMAINE <span className="week-number">--</span></p>
                    <img src="/chevrons-right.svg" alt="next" />
                </div>
                <div className="avaibility">
                    <div className="avaibility-box">
                        <div className="red ping"></div>
                        <p>SÉLECTIONNEZ UNE SALLE</p>
                    </div>
                </div>
            </div>
            <CalendarContainer courses={courses}></CalendarContainer>
            <div className="menu-mobile">
                <div className="current-room">
                    <p>Salle actuelle:</p>
                    <h2 id="room-name">---</h2>
                </div>
                <button className="menu-button">
                    MENU
                </button>
            </div>
        </div>
    )
}