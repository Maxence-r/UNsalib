import { Navigate, Outlet } from "react-router";

import { Dashboard } from "./Dashboard";
import { ProtectedRoute } from "../../utils/ProtectedRoute";
import { Account } from "./account/Account";
import { DASHBOARD_VIEWS } from "./DashboardViews";

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
                    ...("Component" in view
                        ? { Component: view.Component }
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
                                      Component: subview.Component,
                                  })),
                              ],
                          }),
                })),
                { path: "account", element: <Account /> },
            ],
        },
    ],
};

export { dashboardRouter };
