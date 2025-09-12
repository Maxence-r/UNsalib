"use client";

import { useState, useEffect } from "react";
import { ChevronsLeft, ChevronsRight, ChevronUp } from "lucide-react";

import { useSelectedRoomStore } from "../../_utils/store";
import Button from "@/_components/button";
import "./calendar.css";
import {
    START_DAY_HOUR,
    END_DAY_HOUR,
    DAY_DURATION,
    WEEK_DAYS
} from "@/_utils/constants";
import CalendarContainer from "./container";
import { showToast, setToastMessage } from "@/_components/toast";
import { goBack } from "@/_utils/navigation-manager";
import { ApiError, ApiTimetable } from "@/_utils/api-types";

const months: { [key: string]: string } = {
    0: "Janvier",
    1: "Février",
    2: "Mars",
    3: "Avril",
    4: "Mai",
    5: "Juin",
    6: "Juillet",
    7: "Août",
    8: "Septembre",
    9: "Octobre",
    10: "Novembre",
    11: "Décembre"
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

    const [courses, setCourses] = useState<ApiTimetable>({
        "courses": [],
        "weekInfos": {
            "start": "--",
            "end": "--",
            "number": "--"
        }
    });
    const [increment, setIncrement] = useState(0);
    const [previousIncrement, setPreviousIncrement] = useState(0);
    const selectedRoom = useSelectedRoomStore((state) => state.room);
    const [isTimetableLoading, setTimetableLoadState] = useState(false);
    const [hourIndicatorValue, setHourIndicatorValue] = useState(computeHourIndicator().value);
    const [hourIndicatorTop, setHourIndicatorTop] = useState(computeHourIndicator().top);
    const [displayHourIndicator, setHourIndicatorDisplay] = useState(false);

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
        async function render() {
            setTimetableLoadState(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/rooms/timetable/?id=${selectedRoom.id}&increment=${increment}`,
                    { credentials: "include" }
                );
                const coursesData: ApiTimetable | ApiError = await response.json();
                if ("error" in coursesData) {
                    throw new Error("Error fetching the timetable:", coursesData.error as ErrorOptions);
                } else {
                    setCourses(coursesData);
                    setPreviousIncrement(increment);
                }
            } catch {
                setToastMessage("Impossible de récupérer les données pour cette salle.", true);
                showToast();
                setIncrement(previousIncrement);
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
                    <div className="week-switcher-icon" onClick={() => { if (courses.weekInfos.number != "--") setIncrement(increment - 1) }}>
                        <ChevronsLeft size={20} />
                    </div>
                    <div className="week-infos">
                        <p>SEMAINE <span className="week-number">{courses.weekInfos.number}</span></p>
                        {courses.weekInfos.start !== "--" && <span className="week-month">{months[new Date(courses.weekInfos.start).getMonth().toString()]}</span>}
                    </div>
                    <div className="week-switcher-icon" onClick={() => { if (courses.weekInfos.number != "--") setIncrement(increment + 1) }}>
                        <ChevronsRight size={20} />
                    </div>
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
                <Button withIcon icon={<ChevronUp size={20} />} onClick={() => { goBack(); }}>Menu</Button>
            </div>
        </div>
    )
}