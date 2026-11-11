import { Navigate, Outlet } from "react-router";
import { ChartPie, House, Pen } from "lucide-react";

import { Dashboard } from "./Dashboard";
import { ProtectedRoute } from "../../utils/ProtectedRoute";
import { Manage } from "./manage/Manage";
import { Account } from "./account/Account";
import { Home } from "./home/Home";
import type { ReactElement } from "react";

interface View {
    id: string;
    name: string;
    icon: ReactElement<{ size: number }>;
    component: ReactElement;
}

interface GroupView extends Omit<View, "component"> {
    subviews: Omit<View, "icon">[];
}

const DASHBOARD_VIEWS: (View | GroupView)[] = [
    { id: "home", name: "Accueil", icon: <House />, component: <Home /> },
    {
        id: "manage",
        name: "Gestion",
        icon: <Pen />,
        subviews: [
            {
                id: "buildings",
                name: "Bâtiments",
                component: <></>,
            },
            {
                id: "rooms",
                name: "Salles",
                component: <></>,
            },
        ],
    },
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
            children: [
                ...DASHBOARD_VIEWS.map((view) => ({
                    path: view.id,
                    ...("component" in view
                        ? { element: view.component }
                        : {
                              element: <Outlet />,
                              children: [
                                  {
                                      index: true,
                                      element: (
                                          <Navigate
                                              to={`/dashboard/${view.id}/${view.subviews[0].id}`}
                                              replace
                                          />
                                      ),
                                  },
                                  ...view.subviews.map((subview) => ({
                                      path: subview.id,
                                      element: subview.component,
                                  })),
                              ],
                          }),
                })),
                { path: "account", element: <Account /> },
            ],
        },
    ],
};

// eslint-disable-next-line react-refresh/only-export-components
export { dashboardRouter, DASHBOARD_VIEWS, type View, type GroupView };
