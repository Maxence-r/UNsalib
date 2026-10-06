import { useEffect, useState, type ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import { appRouter } from "./app/AppRouter.js";
import { dashboardRouter } from "./dashboard/DashboardRouter.js";
import { authRouter } from "./auth/AuthRouter.js";
import { SendFromQrCode } from "../api/users.api.js";
import { useApi } from "../utils/hooks/api.hook.js";

// eslint-disable-next-line react-refresh/only-export-components
function SendQrCodeAndRedirect(): ReactElement {
    const { isLoading, error } = useApi(new SendFromQrCode(), []);

    return !isLoading || error ? <Navigate to="/app" replace /> : <></>;
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/app" replace />,
    },
    {
        path: "/qrcode",
        element: <SendQrCodeAndRedirect />,
    },
    appRouter,
    authRouter,
    dashboardRouter,
    {
        // 404 Fallback
        path: "*",
        element: <>Not found</>,
    },
]);

export { router };
