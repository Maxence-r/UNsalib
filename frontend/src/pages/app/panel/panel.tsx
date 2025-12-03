import { useState, useEffect, useMemo } from "react";
import { Info, Search, FunnelX } from "lucide-react";

import { Header } from "./header/Header.js";
import { IconButton, TextButton } from "../../../components/button/Button.js";
import { Input } from "../../../components/input/Input.js";
import type { ApiRoom, ApiRoomsList } from "../../../utils/api-types.js";
import {
    usePanelStore,
    useSelectedRoomStore,
} from "../../../stores/app.store.js";
import RoomsList from "./rooms-list/RoomsList.js";
import { socket } from "../../../utils/socket.js";
import "./panel.css";
import { pushToHistory } from "../../../utils/navigation-manager.js";
import { createPortal } from "react-dom";
import { AboutPictosModal } from "./modals/AboutPictosModal.js";
import { SearchModal } from "./modals/SearchModal.js";

function TabView({ roomsList }: { roomsList: ApiRoomsList }) {
    const closePanel = usePanelStore((state) => state.close);
    const openPanel = usePanelStore((state) => state.open);
    const setSelectedRoom = useSelectedRoomStore((state) => state.setRoom);

    //
    const [isAboutPictosModalOpen, setIsAboutPictosModalOpen] =
        useState<boolean>(false);
    const [roomsSearch, setRoomsSearch] = useState<string>("");
    //

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
        <div className="actions_container">
            <div className={`edt-finder displayed`}>
                <Input
                    className="search"
                    type="text"
                    placeholder="Rechercher une salle, un bâtiment..."
                    onInput={(event) =>
                        setRoomsSearch(
                            (event.target as HTMLInputElement).value.toString(),
                        )
                    }
                    value={roomsSearch}
                />
                <div className="results-head">
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                            flexGrow: 1,
                        }}
                    >
                        <p style={{ marginBlock: 0 }}>Salles du campus</p>
                        <div className="badge">Toutes</div>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                flexGrow: 1,
                                justifyContent: "end",
                            }}
                        >
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
                            {/* TODO: fix slow search */}
                        </div>
                    </div>
                </div>
                <RoomsList
                    rooms={roomsList.data}
                    filter={filteredRooms}
                    onRoomClick={loadTimetable}
                ></RoomsList>
            </div>
        </div>
    );
}

export default function Panel({ roomsList }: { roomsList: ApiRoomsList }) {
    const isPanelOpened = usePanelStore((state) => state.isOpened);
    // const [updatedGroupsList, setUpdatedGroupsList] = useState([
    //     "ICI S'AFFICHERA LA MISE À JOUR DES GROUPES",
    // ]);

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            console.log("Connected to Socket.IO server");
        }

        function onDisconnect() {
            console.log("Disconnected from Socket.IO server");
        }

        // function onGroupUpdated(value: { message: string }) {
        //     setUpdatedGroupsList((previous) => {
        //         if (previous.length < 3) {
        //             return [...previous, value.message];
        //         } else {
        //             const newArray = previous.slice(
        //                 previous.length - 3,
        //                 previous.length,
        //             );
        //             newArray.push(value.message);
        //             return newArray;
        //         }
        //     });
        // }

        function onError(error: string) {
            console.error("Socket.IO error:", error);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        // socket.on("main:groupUpdated", onGroupUpdated);
        socket.on("app:main:available", (data) => console.log(data.rooms));
        socket.on("error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            // socket.off("main:groupUpdated", onGroupUpdated);
            socket.off("error", onError);
        };
    }, []);

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
            <Header />
            <TabView roomsList={roomsList}></TabView>
            <div style={{ display: "flex", gap: 12 }}>
                <TextButton
                    className="search-button"
                    text="Chercher une salle"
                    icon={<Search />}
                />
            </div>
        </div>
    );
}
