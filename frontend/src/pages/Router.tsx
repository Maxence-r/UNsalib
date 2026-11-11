import { createBrowserRouter, Navigate } from "react-router";

import { appRouter } from "./app/AppRouter.js";
import { dashboardRouter } from "./dashboard/DashboardRouter.js";
import { authRouter } from "./auth/AuthRouter.js";
import { SendQrCodeAndRedirect } from "../utils/SendQrCodeAndRedirect.js";

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
