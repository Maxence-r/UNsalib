import { Navigate, Outlet, Route, Routes } from "react-router";

function ProtectedRoute() {
    const isLoggedIn = false; // TODO

    return isLoggedIn ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

function DashboardRouter() {
    return (
        <Routes>
            <Route element={<ProtectedRoute />}>
                <Route index element={<>Dashboard</>} />
            </Route>
        </Routes>
    );
}

export { DashboardRouter };
