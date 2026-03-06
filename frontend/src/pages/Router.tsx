import { createBrowserRouter } from "react-router";

import { appRouter } from "./app/AppRouter.js";
import { dashboardRouter } from "./dashboard/DashboardRouter.js";
import { authRouter } from "./auth/AuthRouter.js";

const router = createBrowserRouter([
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
