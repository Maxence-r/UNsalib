import { Navigate, Outlet, Route, Routes } from "react-router";

import { VIEWS } from "./constants";
import { Dashboard } from "./Dashboard";

function ProtectedRoute() {
    const isLoggedIn = true; // TODO

    return isLoggedIn ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

function DashboardRouter() {
    return (
        <Routes>
            <Route element={<ProtectedRoute />}>
                <Route
                    index
                    element={
                        <Navigate to={`/dashboard/${VIEWS[0].id}`} replace />
                    }
                />
                <Route element={<Dashboard />}>
                    {VIEWS.map((view) => (
                        <Route path={view.id} element={view.component} />
                    ))}
                </Route>
            </Route>
        </Routes>
    );
}

export { DashboardRouter, VIEWS };
