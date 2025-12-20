import { Navigate, Outlet, Route, Routes } from "react-router";

import { VIEWS } from "./constants";
import { Auth } from "./Auth";
import { useAccountStore } from "../../stores/account.store";

function AuthRoute() {
    const isLoggedIn = useAccountStore<boolean>((s) => !!s.id);

    return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function AuthRouter() {
    return (
        <Routes>
            <Route element={<AuthRoute />}>
                <Route
                    index
                    element={<Navigate to={`/auth/${VIEWS[0].id}`} replace />}
                />
                <Route element={<Auth />}>
                    {VIEWS.map((view) => (
                        <Route path={view.id} element={view.component} />
                    ))}
                </Route>
            </Route>
        </Routes>
    );
}

export { AuthRouter };
