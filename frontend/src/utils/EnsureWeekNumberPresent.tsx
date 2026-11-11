import { Navigate, Outlet, useLocation, useParams } from "react-router";
import type { ReactElement } from "react";

import { getCurrentWeekNumber } from "./date";

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

export { EnsureWeekNumberPresent };
