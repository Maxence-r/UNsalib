import { Navigate, Outlet, Route, Routes } from "react-router";

import { VIEWS } from "./constants";
import { Dashboard } from "./Dashboard";
import { useAuthStore } from "../../stores/auth.store";
import { refreshToken } from "../../api/axios";
import { useEffect, useRef } from "react";

function ProtectedRoute() {
    const isLoggedIn = useAuthStore<boolean>((s) => !!s.accessToken);
    const isRefreshing = useRef<boolean>(false);

    useEffect(() => {
        if (!isLoggedIn && !isRefreshing.current) {
            isRefreshing.current = true;
            refreshToken().finally(() => {
                isRefreshing.current = false;
            });
        }
    }, [isLoggedIn]);

    return <Outlet />;
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

export { DashboardRouter };
