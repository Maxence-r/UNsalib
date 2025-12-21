import { Navigate } from "react-router";

import { Login } from "./login/Login";
import { Logout } from "./logout/Logout";
import { Auth } from "./Auth";

const AUTH_VIEWS = [
    { id: "login", component: <Login /> },
    { id: "logout", component: <Logout /> },
];

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
            element: view.component,
        })),
    ],
};

export { authRouter, AUTH_VIEWS };
