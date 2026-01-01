import { useState, useMemo, useEffect } from "react";
import { Info, Search, FunnelX } from "lucide-react";

import { IconButton, TextButton } from "../../../components/button/Button.js";
import { Input } from "../../../components/input/Input.js";
import { Header } from "./header/Header.js";
import type { ApiDataRoom } from "../../../utils/types/api.type.js";
import {
    usePanelStore,
    useSelectedRoomStore,
} from "../../../stores/app.store.js";
import { RoomsList } from "./rooms-list/RoomsList.js";
import "./Panel.css";
// import { pushToHistory } from "../../../utils/navigation.js";
import { AboutPictosModal } from "./modals/AboutPictosModal.js";
import { SearchModal } from "./modals/SearchModal.js";
import { Badge } from "../../../components/badge/Badge.js";
import { useApi } from "../../../utils/hooks/api.hook.js";
import { showToast, setToastMessage } from "../../../components/toast/Toast.js";
import { getRoomsList } from "../../../api/rooms.api.js";

function ActionsContainer() {
    const closePanel = usePanelStore((state) => state.close);
    const openPanel = usePanelStore((state) => state.open);
    const setSelectedRoom = useSelectedRoomStore((state) => state.setRoom);
    const [isAboutPictosModalOpen, setIsAboutPictosModalOpen] =
        useState<boolean>(false);
    const [roomsSearch, setRoomsSearch] = useState<string>("");
    const { data: roomsList, isLoading, error } = useApi(getRoomsList, []);

    const loadTimetable = (room: ApiDataRoom) => {
        // pushToHistory("panel", openPanel);
        closePanel();
        setSelectedRoom(room.id, room.name.toUpperCase());
    };

    const normalizeString = (value: string) => {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f\s]/g, "");
    };

    const filteredRooms = useMemo(() => {
        if (roomsList && !isLoading && !error) {
            return roomsList
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
        }
        return [];
    }, [roomsSearch, roomsList, error, isLoading]);

    useEffect(() => {
        if (error) {
            setToastMessage(
                "Impossible de récupérer la liste des salles.",
                true,
            );
            showToast();
        }
    }, [error]);

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
                <Badge text="Filtrées" />
                <div className="actions">
                    <IconButton icon={<FunnelX />} secondary />
                    <AboutPictosModal
                        isOpen={isAboutPictosModalOpen}
                        setIsOpen={setIsAboutPictosModalOpen}
                    />
                    <IconButton
                        icon={<Info />}
                        onClick={() => {
                            setIsAboutPictosModalOpen(true);
                        }}
                        secondary
                    />
                </div>
            </div>
            <RoomsList
                rooms={!isLoading && !error && roomsList ? roomsList : []}
                filter={filteredRooms}
                onRoomClick={loadTimetable}
                isLoading={isLoading || !!error}
            />
        </div>
    );
}

export default function Panel() {
    const isPanelOpened = usePanelStore((state) => state.isOpened);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

    const handleSearchButtonClick = () => {
        setIsSearchModalOpen(true);
    };

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
            <Header />
            <ActionsContainer />
            <TextButton
                className="search-button"
                text="Chercher une salle"
                icon={<Search />}
                onClick={handleSearchButtonClick}
            />
            <SearchModal
                isOpen={isSearchModalOpen}
                setIsOpen={setIsSearchModalOpen}
                // availableRoomsListHook={filteredRooms}
            />
        </div>
    );
}
