import { Navigate, Outlet, Route, Routes } from "react-router";

import { VIEWS } from "./constants";
import { Auth } from "./Auth";

function ProtectedRoute() {
    const isLoggedIn = true; // TODO

    return isLoggedIn ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

function AuthRouter() {
    return (
        <Routes>
            {/* <Route element={<ProtectedRoute />}> */}
                <Route
                    index
                    element={
                        <Navigate to={`/auth/${VIEWS[0].id}`} replace />
                    }
                />
                <Route element={<Auth />}>
                    {VIEWS.map((view) => (
                        <Route path={view.id} element={view.component} />
                    ))}
                {/* </Route> */}
            </Route>
        </Routes>
    );
}

export { AuthRouter };
