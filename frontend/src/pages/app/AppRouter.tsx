import { Navigate, Outlet, useLocation, useParams } from "react-router";
import type { ReactElement } from "react";

import { App } from "./App";
import { Calendar } from "./calendar/calendar";
import { About } from "./about/About";
import { getCurrentWeekNumber } from "../../utils/date";
import { Grid } from "./calendar/grid/Grid";

// eslint-disable-next-line react-refresh/only-export-components
function EnsureWeekNumberPresent(): ReactElement {
    const params = useParams<"roomId" | "weekNumber">();
    const searchParams = useLocation().search;
    if (!params.roomId) return <Navigate to="/app" replace />;

    return params.weekNumber ? (
        <Outlet />
    ) : (
        <Navigate
            to={`/app/timetable/${params.roomId}/${getCurrentWeekNumber()}${searchParams}`}
            replace
        />
    );
}

const appRouter = {
    path: "/app",
    element: <App />,
    children: [
        {
            index: true,
            element: <Calendar showDefault />,
        },
        {
            path: "/app/timetable",
            element: <Calendar />,
            children: [
                {
                    index: true,
                    element: <Navigate to="/app" replace />,
                },
                {
                    path: "/app/timetable/:roomId",
                    element: <EnsureWeekNumberPresent />,
                    children: [
                        {
                            path: "/app/timetable/:roomId/:weekNumber",
                            element: <Grid />,
                        },
                    ],
                },
            ],
        },
        {
            path: "/app/settings",
            element: <About />,
        },
    ],
};

export { appRouter };
