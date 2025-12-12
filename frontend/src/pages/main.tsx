import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";

import "../utils/theme.css";
import { App } from "./app/App.js";
import "./main.css";
import { AuthRouter } from "./auth/AuthRouter.js";
import { DashboardRouter } from "./dashboard/AdminRouter.js";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<App />} />
                <Route path="/auth/*" element={<AuthRouter />} />
                <Route path="/dashboard/*" element={<DashboardRouter />} />
                {/* Catch-all route for 404 */}
                <Route path="*" element={<>Not found</>} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
