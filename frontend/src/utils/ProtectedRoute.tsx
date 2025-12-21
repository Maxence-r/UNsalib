import { Outlet, Navigate } from "react-router";

import { useAuth } from "./hooks/auth.hook";

function ProtectedRoute() {
    const { isLoading, isLoggedIn } = useAuth();

    if (isLoading) return <></>;

    return isLoggedIn ? <Outlet /> : <Navigate to="/auth/login" />;
}

export { ProtectedRoute };
