import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/cal-sans/400.css";

import "../utils/theme.css";
import "./main.css";
import { router } from "./Router.js";
import { ThemeProvider } from "../utils/ThemeProvider.js";
import { ModalProvider } from "../components/modal/Modal.js";
import { ToastProvider } from "../components/toast/Toast.js";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <RouterProvider router={router} />
            <ModalProvider zIndex={20} />
            <ToastProvider zIndex={30} />
        </ThemeProvider>
    </StrictMode>,
);
