import { Input } from "../components/input/Input";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Input placeholder="test" />
    </StrictMode>,
);
