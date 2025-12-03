import { useState, useMemo } from "react";
import { Info, Search, FunnelX } from "lucide-react";

import { IconButton, TextButton } from "../../../components/button/Button.js";
import { Input } from "../../../components/input/Input.js";
import { Header } from "./header/Header.js";
import type { ApiRoom, ApiRoomsList } from "../../../utils/api-types.js";
import {
    usePanelStore,
    useSelectedRoomStore,
} from "../../../stores/app.store.js";
import { RoomsList } from "./rooms-list/RoomsList.js";
import "./Panel.css";
import { pushToHistory } from "../../../utils/navigation-manager.js";
import { createPortal } from "react-dom";
import { AboutPictosModal } from "./modals/AboutPictosModal.js";
import { SearchModal } from "./modals/SearchModal.js";
import { Badge } from "../../../components/badge/Badge.js";

function ActionsContainer({ roomsList }: { roomsList: ApiRoomsList }) {
    const closePanel = usePanelStore((state) => state.close);
    const openPanel = usePanelStore((state) => state.open);
    const setSelectedRoom = useSelectedRoomStore((state) => state.setRoom);
    const [isAboutPictosModalOpen, setIsAboutPictosModalOpen] =
        useState<boolean>(false);
    const [roomsSearch, setRoomsSearch] = useState<string>("");

    function loadTimetable(room: ApiRoom) {
        pushToHistory("panel", openPanel);
        closePanel();
        setSelectedRoom(room.id, room.name.toUpperCase());
    }

    function normalizeString(value: string) {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f\s]/g, "");
    }

    const filteredRooms = useMemo(() => {
        return roomsList.data
            .map((room) => {
                if (
                    normalizeString(room.name).includes(
                        normalizeString(roomsSearch),
                    ) ||
                    normalizeString(room.building).includes(
                        normalizeString(roomsSearch),
                    )
                ) {
                    return room.id;
                }
                return null;
            })
            .filter((id) => id != null);
    }, [roomsSearch, roomsList.data]);

    return (
        <div className="actions-container">
            <Input
                type="text"
                placeholder="Rechercher une salle, un bâtiment..."
                onInput={(event) =>
                    setRoomsSearch(
                        (event.target as HTMLInputElement).value.toString(),
                    )
                }
                value={roomsSearch}
            />
            <div className="head">
                <p>Salles du campus</p>
                <Badge text="Toutes" />
                <div className="actions">
                    <IconButton icon={<FunnelX />} secondary />
                    {createPortal(
                        <AboutPictosModal
                            isOpen={isAboutPictosModalOpen}
                            setIsOpen={setIsAboutPictosModalOpen}
                        />,
                        document.body,
                    )}
                    <IconButton
                        icon={<Info />}
                        onClick={() => {
                            setIsAboutPictosModalOpen(true);
                        }}
                        secondary
                    />
                    {createPortal(
                        <SearchModal
                            isOpen={isAboutPictosModalOpen}
                            setIsOpen={setIsAboutPictosModalOpen}
                            availableRoomsListHook={filteredRooms}
                        />,
                        document.body,
                    )}
                </div>
            </div>
            <RoomsList
                rooms={roomsList.data}
                filter={filteredRooms}
                onRoomClick={loadTimetable}
            ></RoomsList>
        </div>
    );
}

export default function Panel({ roomsList }: { roomsList: ApiRoomsList }) {
    const isPanelOpened = usePanelStore((state) => state.isOpened);

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
            <Header />
            <ActionsContainer roomsList={roomsList} />
            <TextButton
                className="search-button"
                text="Chercher une salle"
                icon={<Search />}
            />
        </div>
    );
}
