import {
    useState,
    useEffect,
    useReducer,
    type ActionDispatch,
    useMemo,
} from "react";
import { ChevronUp } from "lucide-react";

import { useSelectedRoomStore } from "../../../stores/app.store.js";
import { TextButton } from "../../../components/button/Button.js";
import "./calendar.css";
// import {
//     START_DAY_HOUR,
//     END_DAY_HOUR,
//     DAY_DURATION,
//     WEEK_DAYS,
// } from "../../../utils/constants.js";
// import CalendarContainer from "./grid/container.js";
import { showToast, setToastMessage } from "../../../components/toast/Toast.js";
import { goBack } from "../../../utils/navigation-manager.js";
import type {
    ApiDataCourse,
    ApiDataTimetable,
} from "../../../utils/types/api.type.js";
import { ActionBar } from "./action-bar/ActionBar.js";
import { Grid } from "./grid/Grid.js";
import { useFetch } from "../../../utils/hooks/fetch.hook.js";

function incrementReducer(
    state: { value: number; previous: number },
    action: "increase" | "decrease" | "reset-previous" | "reset",
) {
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
                previous: 0,
                value: 0,
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
    const selectedRoom = useSelectedRoomStore((state) => state.room);

    const [increment, incrementDispatch] = useReducer(incrementReducer, {
        value: 0,
        previous: 0,
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
    const timetableUrl = useMemo(() => {
        if (selectedRoom.id != "") {
            return `${import.meta.env.VITE_BACKEND_URL}/rooms/timetable?id=${selectedRoom.id}&increment=${increment.value}`;
        }
    }, [selectedRoom, increment]);

    const { isLoading, data, error } = useFetch(timetableUrl ?? "");

    const courses = useMemo(() => {
        if (error) {
            // setToastMessage(
            //     "Impossible de récupérer les données pour cette salle.",
            //     true,
            // );
            // showToast();
            incrementDispatch("reset-previous");
        } else if (!isLoading && data) {
            return data as ApiDataTimetable;
        }
    }, [data, error, isLoading]);

    return (
        <div className="main">
            {isLoading && timetableUrl && (
                <div className="loader-indicator">
                    <span className="spin"></span>
                    <p>Chargement de l&apos;EDT...</p>
                </div>
            )}
            <ActionBar
                incrementDispatch={incrementDispatch}
                currentRoom={selectedRoom.id ? selectedRoom.name : null}
                weekNumber={courses ? courses.weekInfos.number : null}
                weekStartDate={
                    courses ? new Date(courses.weekInfos.number) : null
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

export { Calendar };
