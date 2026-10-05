import { useState, useMemo, useEffect, type ReactElement } from "react";
import { FunnelX, Search, CircleQuestionMark } from "lucide-react";

import {
    IconButton,
    TextButton,
} from "../../../../components/button/Button.js";
import { Input } from "../../../../components/input/Input.js";
import type { ApiDataRoom } from "../../../../utils/types/api.type.js";
import {
    usePanelStore,
    useCurrentRoomStore,
} from "../../../../stores/app.store.js";
import { RoomsList } from "./rooms-list/RoomsList.js";
import { AboutPictosModal } from "./modals/AboutPictosModal.js";
import { SearchModal } from "./modals/SearchModal.js";
import { Badge } from "../../../../components/badge/Badge.js";
import { useApi } from "../../../../utils/hooks/api.hook.js";
import { getRoomsList } from "../../../../api/rooms.api.js";
import { useModal } from "../../../../components/modal/Modal.js";
import { useToast } from "../../../../components/toast/Toast.js";
import { Link } from "react-router";
import "./Home.css";
import { Header } from "./header/Header.js";
import { useSettingsStore } from "../../../../stores/settings.store.js";

function ActionsContainer(): ReactElement {
    const closePanel = usePanelStore((state) => state.close);
    // const openPanel = usePanelStore((state) => state.open);
    const setCurrentRoom = useCurrentRoomStore((state) => state.setRoom);
    const [roomsSearch, setRoomsSearch] = useState<string>("");
    const defaultCampus = useSettingsStore((s) => s.defaultCampus);
    const {
        data: roomsList,
        isLoading,
        error,
    } = useApi(() => getRoomsList(defaultCampus), [defaultCampus]);
    const { open: openAboutPictosModal } = useModal(
        "about-pictos",
        <AboutPictosModal />,
    );
    const { open: openToast } = useToast();

    const loadTimetable = (room: ApiDataRoom) => {
        // pushToHistory("panel", openPanel);
        closePanel();
        setCurrentRoom(room.id, room.name.toUpperCase());
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
        if (error) openToast("Impossible de récupérer la liste des salles.");
    }, [error, openToast]);

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
                    <IconButton
                        icon={<CircleQuestionMark />}
                        onClick={openAboutPictosModal}
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

function Home(): ReactElement {
    const { open: openSearchModal } = useModal("search", <SearchModal />);

    return (
        <div className="home">
            <Header />
            <ActionsContainer />
            <TextButton
                className="search-button"
                text="Chercher une salle"
                icon={<Search />}
                onClick={openSearchModal}
            />
        </div>
    );
}

export { Home };
