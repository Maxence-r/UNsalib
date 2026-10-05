import { useEffect, useReducer } from "react";
import { ChevronUp } from "lucide-react";

import { TextButton } from "../../../components/button/Button.js";
import "./calendar.css";
import { ActionBar } from "./action-bar/ActionBar.js";
import { useApi } from "../../../utils/hooks/api.hook.js";
import { getRoomTimetable } from "../../../api/timetables.api.js";
import { useToast } from "../../../components/toast/Toast.js";
import type { ApiDataTimetable } from "../../../utils/types/api.type.js";
import { getCurrentWeekNumber } from "../../../utils/date.js";
import { Navigate, Outlet, useParams } from "react-router";
import { router } from "../../Router.js";

function weekNumberReducer(
    state: { value: number; previous: number },
    action: "increase" | "decrease" | "reset-previous" | "reset",
): {
    previous: number;
    value: number;
} {
    switch (action) {
        case "increase":
            router.navigate(
                router.state.location.pathname.slice(
                    0,
                    router.state.location.pathname.length - 2,
                ) +
                    (state.value + 1),
                {
                    replace: true,
                },
            );
            return {
                previous: state.value,
                value: state.value + 1,
            };

        case "decrease":
            router.navigate(
                router.state.location.pathname.slice(
                    0,
                    router.state.location.pathname.length - 2,
                ) +
                    (state.value - 1),
                {
                    replace: true,
                },
            );
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

function Calendar({ showDefault = false }: { showDefault?: boolean }) {
    const [weekNumber, weekNumberDispatch] = useReducer(weekNumberReducer, {
        value: getCurrentWeekNumber(),
        previous: getCurrentWeekNumber(),
    });

    const params = useParams<"roomId" | "weekNumber">();
    // if (!params.roomId) return <Navigate to="/app" />;

    const currentRoom = params.roomId;
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
        currentRoom
            ? () => getRoomTimetable(currentRoom, weekNumber.value)
            : () => null,
        [currentRoom, weekNumber.value],
    );

    const { open: openToast } = useToast();

    useEffect(() => {
        if (error)
            openToast("Impossible de récupérer les données pour cette salle.");
    }, [error, openToast]);

    return (
        <>
            <ActionBar
                weekNumberDispatch={weekNumberDispatch}
                currentRoom={currentRoom}
                weekNumber={courses ? courses.weekInfos.number : null}
                weekStartDate={
                    courses ? new Date(courses.weekInfos.start) : null
                }
            />
            <div className="calendar">
                {showDefault ? <>Sélectionnez une salle</> : <Outlet />}
            </div>
            <div className="menu-mobile">
                <div className="current-room">
                    <p>Salle actuelle :</p>
                    <h2 id="room-name">{currentRoom ? currentRoom : "--"}</h2>
                </div>
                <TextButton
                    icon={<ChevronUp />}
                    onClick={() => {
                        router.navigate(-1);
                    }}
                    text="Menu"
                />
            </div>
        </>
    );
}

export { Calendar };
