import { useState, useMemo, useEffect } from "react";
import { Info, Search, FunnelX } from "lucide-react";

import { IconButton, TextButton } from "../../../components/button/Button.js";
import { Input } from "../../../components/input/Input.js";
import { Header } from "./header/Header.js";
import type { ApiRoom } from "../../../utils/types/api.type.js";
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
import { useFetch } from "../../../utils/hooks/fetch.hook.js";
import { showToast, setToastMessage } from "../../../components/toast/Toast.js";

function ActionsContainer() {
    const closePanel = usePanelStore((state) => state.close);
    const openPanel = usePanelStore((state) => state.open);
    const setSelectedRoom = useSelectedRoomStore((state) => state.setRoom);
    const [isAboutPictosModalOpen, setIsAboutPictosModalOpen] =
        useState<boolean>(false);
    const [roomsSearch, setRoomsSearch] = useState<string>("");
    const { isLoading, data, error } = useFetch(
        `${import.meta.env.VITE_BACKEND_URL}/rooms`,
    );

    const loadTimetable = (room: ApiRoom) => {
        pushToHistory("panel", openPanel);
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
        if (!isLoading && !error) {
            return (data as ApiRoom[])
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
    }, [roomsSearch, data, error, isLoading]);

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
                            // availableRoomsListHook={filteredRooms}
                        />,
                        document.body,
                    )}
                </div>
            </div>
            <RoomsList
                rooms={!isLoading && !error ? (data as ApiRoom[]) : []}
                filter={filteredRooms}
                onRoomClick={loadTimetable}
                isLoading={isLoading || error}
            />
        </div>
    );
}

export default function Panel() {
    const isPanelOpened = usePanelStore((state) => state.isOpened);

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
            <Header />
            <ActionsContainer />
            <TextButton
                className="search-button"
                text="Chercher une salle"
                icon={<Search />}
            />
        </div>
    );
}
