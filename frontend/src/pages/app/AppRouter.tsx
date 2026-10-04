import { App } from "./App";
import { Calendar } from "./calendar/calendar";
import { About } from "./about/About";

const appRouter = {
    path: "/app",
    element: <App />,
    children: [
        {
            index: true,
            element: <Calendar />,
        },
        {
            path: "/app/settings",
            element: <About />,
        },
    ],
};

export { appRouter };
