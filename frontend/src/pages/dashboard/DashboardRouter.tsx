import { Navigate } from "react-router";
import { ChartPie, House, Pen } from "lucide-react";

import { Dashboard } from "./Dashboard";
import { ProtectedRoute } from "../../utils/ProtectedRoute";
import { Manage } from "./manage/Manage";

const DASHBOARD_VIEWS = [
    { id: "home", name: "Accueil", icon: <House />, component: <></> },
    { id: "manage", name: "Gestion", icon: <Pen />, component: <Manage /> },
    { id: "stats", name: "Statistiques", icon: <ChartPie />, component: <></> },
];

const dashboardRouter = {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
        {
            index: true,
            element: (
                <Navigate to={`/dashboard/${DASHBOARD_VIEWS[0].id}`} replace />
            ),
        },
        {
            element: <Dashboard />,
            children: DASHBOARD_VIEWS.map((view) => ({
                path: view.id,
                element: view.component,
            })),
        },
    ],
};

export { dashboardRouter, DASHBOARD_VIEWS };
