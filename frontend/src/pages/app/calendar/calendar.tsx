import { useEffect, useReducer } from "react";
import { ChevronUp } from "lucide-react";

import { useCurrentRoomStore } from "../../../stores/app.store.js";
import { TextButton } from "../../../components/button/Button.js";
import "./calendar.css";
// import {
//     START_DAY_HOUR,
//     END_DAY_HOUR,
//     DAY_DURATION,
//     WEEK_DAYS,
// } from "../../../utils/constants.js";
// import CalendarContainer from "./grid/container.js";
// import { goBack } from "../../../utils/navigation.js";
// import type {
//     ApiDataCourse,
//     ApiDataTimetable,
// } from "../../../utils/types/api.type.js";
import { ActionBar } from "./action-bar/ActionBar.js";
import { Grid } from "./grid/Grid.js";
import { useApi } from "../../../utils/hooks/api.hook.js";
import { getRoomTimetable } from "../../../api/timetables.api.js";
import { useToast } from "../../../components/toast/Toast.js";
import type { ApiDataTimetable } from "../../../utils/types/api.type.js";
import { getCurrentWeekNumber } from "../../../utils/date.js";

function weekNumberReducer(
    state: { value: number; previous: number },
    action: "increase" | "decrease" | "reset-previous" | "reset",
): {
    previous: number;
    value: number;
} {
    switch (action) {
        case "increase":
            return {
                previous: state.value,
                value: state.value + 1,
            };

        case "decrease":
            return {
                previous: state.value,
                value: state.value - 1,
            };

        case "reset-previous":
            return {
                previous: state.previous,
                value: state.previous,
            };

        case "reset":
            return {
                previous: getCurrentWeekNumber(),
                value: getCurrentWeekNumber(),
            };

        default:
            return {
                previous: state.previous,
                value: state.value,
            };
    }
}

function Calendar() {
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

    // const [courses, setCourses] = useState<ApiDataTimetable | null>(null);
    // const [increment, setIncrement] = useState(0);
    // const [previousIncrement, setPreviousIncrement] = useState(0);
    // const [timetableUrl, setTimetableUrl] = useState<string>("");
    const currentRoom = useCurrentRoomStore((state) => state.room);

    const [weekNumber, weekNumberDispatch] = useReducer(weekNumberReducer, {
        value: getCurrentWeekNumber(),
        previous: getCurrentWeekNumber(),
    });
    // const [isTimetableLoading, setTimetableLoadState] = useState(false);
    // const [hourIndicatorValue, setHourIndicatorValue] = useState(
    //     computeHourIndicator().value,
    // );
    // const [hourIndicatorTop, setHourIndicatorTop] = useState(
    //     computeHourIndicator().top,
    // );
    // const [displayHourIndicator, setHourIndicatorDisplay] = useState(false);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const hourIndicatorProperties = computeHourIndicator();
    //         setHourIndicatorDisplay(hourIndicatorProperties.display);
    //         setHourIndicatorValue(hourIndicatorProperties.value);
    //         setHourIndicatorTop(hourIndicatorProperties.top);
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, [hourIndicatorValue]);
    // const timetableUrl = useMemo(() => {
    //     if (currentRoom.id != "") {
    //         return `${import.meta.env.VITE_BACKEND_URL}/rooms/timetable?id=${currentRoom.id}&increment=${increment.value}`;
    //     }
    // }, [currentRoom, increment]);

    const {
        isLoading,
        data: courses,
        error,
    } = useApi<ApiDataTimetable | null>(
        currentRoom ? () => getRoomTimetable(currentRoom.id, weekNumber.value) : () => null,
        [currentRoom?.id, weekNumber.value],
    );

    const { open: openToast } = useToast();

    useEffect(() => {
        if (error)
            openToast("Impossible de récupérer les données pour cette salle.");
    }, [error, openToast]);

    return (
        <>
            {isLoading && currentRoom && (
                <div className="loader-indicator">
                    <span className="spin"></span>
                    <p>Chargement de l&apos;EDT...</p>
                </div>
            )}
            <ActionBar
                weekNumberDispatch={weekNumberDispatch}
                currentRoom={currentRoom?.name}
                weekNumber={courses ? courses.weekInfos.number : null}
                weekStartDate={
                    courses ? new Date(courses.weekInfos.start) : null
                }
            />
            <Grid
                courses={courses ? courses.courses : []}
                weekStart={courses ? new Date(courses.weekInfos.start) : null}
                weekEnd={courses ? new Date(courses.weekInfos.end) : null}
            />
            <div className="menu-mobile">
                <div className="current-room">
                    <p>Salle actuelle :</p>
                    <h2 id="room-name">
                        {currentRoom ? currentRoom.name : "--"}
                    </h2>
                </div>
                <TextButton
                    icon={<ChevronUp />}
                    onClick={() => {
                        // goBack();
                    }}
                    text="Menu"
                />
            </div>
        </>
    );
}

export { Calendar };
