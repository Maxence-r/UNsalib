import { Input } from "../components/Input/Input";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Input placeholder="test" />
    </StrictMode>,
);
