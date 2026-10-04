import { createBrowserRouter, Navigate } from "react-router";

import { appRouter } from "./app/AppRouter.js";
import { dashboardRouter } from "./dashboard/DashboardRouter.js";
import { authRouter } from "./auth/AuthRouter.js";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/app" replace />,
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
