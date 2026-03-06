// import { useState, useMemo, useEffect } from "react";
// import { Info, Search, FunnelX } from "lucide-react";

// import { IconButton, TextButton } from "../../../components/button/Button.js";
// import { Input } from "../../../components/input/Input.js";
// import { Header } from "./header/Header.js";
// import type { ApiDataRoom } from "../../../utils/types/api.type.js";
import {
    usePanelStore,
    useCurrentRoomStore,
} from "../../../stores/app.store.js";
// import { RoomsList } from "./rooms-list/RoomsList.js";
// import "./Panel.css";
// // import { pushToHistory } from "../../../utils/navigation.js";
// import { AboutPictosModal } from "./modals/AboutPictosModal.js";
// import { SearchModal } from "./modals/SearchModal.js";
// import { Badge } from "../../../components/badge/Badge.js";
// import { useApi } from "../../../utils/hooks/api.hook.js";
// import { getRoomsList } from "../../../api/rooms.api.js";
// import { useModal } from "../../../components/modal/Modal.js";
// import { useToast } from "../../../components/toast/Toast.js";
import { Outlet } from "react-router";

function Panel() {
    const isPanelOpened = usePanelStore((state) => state.isOpened);

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
            <Outlet />
        </div>
    );
}

export { Panel };
