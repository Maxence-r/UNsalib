import { createBrowserRouter } from "react-router";

import { App } from "./app/App.js";
import { dashboardRouter } from "./dashboard/DashboardRouter.js";
import { authRouter } from "./auth/AuthRouter.js";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    authRouter,
    dashboardRouter,
    {
        // 404 Fallback
        path: "*",
        element: <>Not found</>,
    },
]);

export { router };
