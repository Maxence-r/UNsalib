import { Navigate } from "react-router";

import { App } from "./App";
import { Calendar } from "./calendar/calendar";
import { About } from "./about/About";
import { Grid } from "./calendar/grid/Grid";
import { EnsureWeekNumberPresent } from "../../utils/EnsureWeekNumberPresent";


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
