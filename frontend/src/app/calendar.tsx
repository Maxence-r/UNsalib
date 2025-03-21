"use client";
import { useState, useEffect } from "react";
import { ApiCoursesResponseType, ApiCourseType } from "./types";
import { useModalStore, usePanelStore, useSelectedRoomStore, useTimetableStore, useToastStore } from './store';
import Image from "next/image";
import Button from "@/components/button";

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
        currentDayHours.forEach((hour) => {
            if (course.start.split("T")[1].startsWith(hour.hour)) {
                hour.courses.push(course);
                return;
            }
        });
    });

    return (
        <div className="column">
            <div className={`calendar-top ${new Date().getDate() == parseInt(dayNumber) ? "selected" : ""}`}>
                <p>
                    {dayName}
                    <span className="day">{" " + dayNumber}</span>
                </p>
            </div>
            <div className="column-content">
                {currentDayHours.map(dayHour => <CalendarBox key={dayHour.hour} hourCourses={dayHour.courses}></CalendarBox>)}
            </div>
        </div>
    )
}

function CalendarContainer({ courses, hourIndicatorValue, hourIndicatorTop, displayHourIndicator }: { courses: ApiCoursesResponseType, hourIndicatorValue: string, hourIndicatorTop: string, displayHourIndicator: boolean }) {
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
        currentWeekDays.forEach((day) => {
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
                    <div
                        className="indicator-hour"
                        style={{ display: displayHourIndicator ? "flex" : "none", top: hourIndicatorTop + "%" }}
                    >
                        <span className="bubble">{hourIndicatorValue}</span>
                        <div className="bar"></div>
                    </div>
                </div>
            </div>
            <div className="calendar-columns">
                {currentWeekDays.map(currentDay => (
                    <CalendarColumn
                        key={currentDay.name}
                        dayName={currentDay.name}
                        dayNumber={currentDay.number}
                        dayCourses={currentDay.courses}
                    ></CalendarColumn>
                ))}
            </div>
        </div >
    )
}

export default function Calendar() {
    function computeHourIndicator() {
        const dateActuelle = new Date();
        const jourActuel = dateActuelle.getDay();
        const heureActuelle = dateActuelle.getHours();
        const minuteActuelle = dateActuelle.getMinutes();
        if (heureActuelle >= START_DAY_HOUR && heureActuelle < END_DAY_HOUR && jourActuel > 0 && jourActuel <= WEEK_DAYS.length) {
            const top = (100 * (heureActuelle - START_DAY_HOUR)) / DAY_DURATION + (100 / DAY_DURATION) * (minuteActuelle / 60);
            return {
                value: heureActuelle + ":" + (minuteActuelle.toString().length == 2 ? minuteActuelle : "0" + minuteActuelle),
                top: top.toString(),
                display: true
            };
        } else {
            return { value: "", top: "", display: false };
        }
    }

    const [courses, setCourses] = useState({
        "courses": [],
        "weekInfos": {
            "start": "--",
            "end": "--",
            "number": "--"
        }
    });
    const [increment, setIncrement] = useState(0);
    const openPanel = usePanelStore((state) => state.open);
    const isPanelOpened = usePanelStore((state) => state.isOpened);
    const selectedRoom = useSelectedRoomStore((state) => state.room);
    const setTimetableLoadState = useTimetableStore((state) => state.setLoading);
    const isTimetableLoading = useTimetableStore((state) => state.isLoading);
    const showToast = useToastStore((state) => state.open);
    const setToastContent = useToastStore((state) => state.setContent);
    const setToastAsError = useToastStore((state) => state.setError);
    const [hourIndicatorValue, setHourIndicatorValue] = useState(computeHourIndicator().value);
    const [hourIndicatorTop, setHourIndicatorTop] = useState(computeHourIndicator().top);
    const [displayHourIndicator, setHourIndicatorDisplay] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            const hourIndicatorProperties = computeHourIndicator();
            setHourIndicatorDisplay(hourIndicatorProperties.display);
            setHourIndicatorValue(hourIndicatorProperties.value);
            setHourIndicatorTop(hourIndicatorProperties.top);
        }, 1000);

        return () => clearInterval(interval);
    }, [hourIndicatorValue]);

    useEffect(() => {
        if (!isPanelOpened) {
            window.history.pushState({ modalOpened: true }, "");

            const handlePopState = () => {
                if (!isPanelOpened) openPanel();
            };

            window.addEventListener("popstate", handlePopState);

            return () => window.removeEventListener("popstate", handlePopState);
        }
    }, [isPanelOpened, openPanel]);

    useEffect(() => {
        async function render() {
            setTimetableLoadState(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/timetable/?id=${selectedRoom.id}&increment=${increment}`);
                const coursesData = await response.json();
                setCourses(coursesData);
            } catch {
                setToastContent("Impossible de récupérer les données, elles n'ont sans doute pas été enregistrées au-delà !");
                setToastAsError(true);
                showToast();
            } finally {
                setTimetableLoadState(false);
            }
        }

        if (selectedRoom.id != "") {
            render();
        }
    }, [selectedRoom, increment]);

    return (
        <div className="calendar">
            <div className="loader-indicator" style={{ display: isTimetableLoading ? "flex" : "none" }}>
                <span className="spin"></span>
                <p>Chargement de l&apos;EDT...</p>
            </div>
            <div className="calendar-header">
                <div className="week-switcher">
                    <Image src="/chevrons-left.svg" width={11} height={11} alt="Semaine précédente" onClick={() => { if (courses.weekInfos.number != "--") setIncrement(increment - 1) }}></Image>
                    <p>SEMAINE <span className="week-number">{courses.weekInfos.number}</span></p>
                    <Image src="/chevrons-right.svg" width={11} height={11} alt="Semaine suivante" onClick={() => { if (courses.weekInfos.number != "--") setIncrement(increment + 1) }}></Image>
                </div>
                <div className="availability">
                    <div className="availability-box">
                        <p>{selectedRoom.id == "" ? "SÉLECTIONNEZ UNE SALLE" : selectedRoom.name}</p>
                    </div>
                </div>
            </div>
            <CalendarContainer
                courses={courses}
                hourIndicatorValue={hourIndicatorValue}
                hourIndicatorTop={hourIndicatorTop}
                displayHourIndicator={displayHourIndicator}
            ></CalendarContainer>
            <div className="menu-mobile">
                <div className="current-room">
                    <p>Salle actuelle :</p>
                    <h2 id="room-name">{selectedRoom.id == "" ? "--" : selectedRoom.name}</h2>
                </div>
                <Button iconPath="/up.svg" onClick={() => openPanel()}>Menu</Button>
            </div>
        </div>
    )
}