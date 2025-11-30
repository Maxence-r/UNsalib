import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

import { useSelectedRoomStore } from "../../../stores/app.store.js";
import { TextButton } from "../../../components/button/Button.js";
import "./calendar.css";
import {
    START_DAY_HOUR,
    END_DAY_HOUR,
    DAY_DURATION,
    WEEK_DAYS,
} from "../../../utils/constants.js";
import CalendarContainer from "./container.js";
import { showToast, setToastMessage } from "../../../components/toast/Toast.js";
import { goBack } from "../../../utils/navigation-manager.js";
import type {
    ApiCourses,
    ApiError,
    ApiTimetable,
    ApiWeekInfos,
} from "../../../utils/api-types.js";
import { ActionBar } from "./action-bar/ActionBar.js";

export default function Calendar() {
    function computeHourIndicator() {
        const dateActuelle = new Date();
        const jourActuel = dateActuelle.getDay();
        const heureActuelle = dateActuelle.getHours();
        const minuteActuelle = dateActuelle.getMinutes();
        if (
            heureActuelle >= START_DAY_HOUR &&
            heureActuelle < END_DAY_HOUR &&
            jourActuel > 0 &&
            jourActuel <= WEEK_DAYS.length
        ) {
            const top =
                (100 * (heureActuelle - START_DAY_HOUR)) / DAY_DURATION +
                (100 / DAY_DURATION) * (minuteActuelle / 60);
            return {
                value:
                    heureActuelle +
                    ":" +
                    (minuteActuelle.toString().length == 2
                        ? minuteActuelle
                        : "0" + minuteActuelle),
                top: top.toString(),
                display: true,
            };
        } else {
            return { value: "", top: "", display: false };
        }
    }

    const [courses, setCourses] = useState<{
        courses: ApiCourses;
        weekInfos: ApiWeekInfos;
    }>({
        courses: [],
        weekInfos: {
            start: "--",
            end: "--",
            number: -1,
        },
    });
    const [increment, setIncrement] = useState(0);
    const [previousIncrement, setPreviousIncrement] = useState(0);
    const selectedRoom = useSelectedRoomStore((state) => state.room);
    const [isTimetableLoading, setTimetableLoadState] = useState(false);
    const [hourIndicatorValue, setHourIndicatorValue] = useState(
        computeHourIndicator().value,
    );
    const [hourIndicatorTop, setHourIndicatorTop] = useState(
        computeHourIndicator().top,
    );
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
                    `http://localhost:9000/rooms/timetable?id=${selectedRoom.id}&increment=${increment}`,
                    { credentials: "include" },
                );
                const coursesData: ApiTimetable | ApiError =
                    await response.json();
                if ("error" in coursesData) {
                    throw new Error(
                        "Error fetching the timetable:",
                        coursesData.error as ErrorOptions,
                    );
                } else {
                    setCourses(coursesData.data);
                    setPreviousIncrement(increment);
                }
            } catch {
                setToastMessage(
                    "Impossible de récupérer les données pour cette salle.",
                    true,
                );
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
            <div
                className="loader-indicator"
                style={{ display: isTimetableLoading ? "flex" : "none" }}
            >
                <span className="spin"></span>
                <p>Chargement de l&apos;EDT...</p>
            </div>
            <ActionBar
                increment={increment}
                setIncrement={setIncrement}
                currentRoom={selectedRoom.id ? selectedRoom.name : null}
                weekNumber={
                    courses.weekInfos.number != -1
                        ? courses.weekInfos.number
                        : null
                }
                weekStartDate={
                    courses.weekInfos.start != "--"
                        ? new Date(courses.weekInfos.start)
                        : null
                }
            />
            <CalendarContainer
                courses={courses}
                hourIndicatorValue={hourIndicatorValue}
                hourIndicatorTop={hourIndicatorTop}
                displayHourIndicator={displayHourIndicator}
            ></CalendarContainer>
            <div className="menu-mobile">
                <div className="current-room">
                    <p>Salle actuelle :</p>
                    <h2 id="room-name">
                        {selectedRoom.id == "" ? "--" : selectedRoom.name}
                    </h2>
                </div>
                <TextButton
                    icon={<ChevronUp />}
                    onClick={() => {
                        goBack();
                    }}
                    text="Menu"
                />
            </div>
        </div>
    );
}
