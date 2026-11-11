import { Navigate } from "react-router";

import { Auth } from "./Auth";
import { AUTH_VIEWS } from "./AuthViews";

const authRouter = {
    path: "/auth",
    element: <Auth />,
    children: [
        {
            index: true,
            element: <Navigate to={`/auth/${AUTH_VIEWS[0].id}`} replace />,
        },
        ...AUTH_VIEWS.map((view) => ({
            path: view.id,
            Component: view.Component,
        })),
    ],
};

export { authRouter };
