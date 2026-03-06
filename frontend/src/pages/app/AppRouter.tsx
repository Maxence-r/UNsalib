import { Navigate } from "react-router";

import { App } from "./App";
import { Panel } from "./panel/Panel";
import { Settings } from "./panel/settings/Settings";
import { Home } from "./panel/home/Home";

const appRouter = {
    path: "/",
    element: <App />,
    children: [
        {
            index: true,
            element: <Home />,
        },
        {
            path: "settings",
            element: <Settings />,
        },
    ],
};

export { appRouter };
