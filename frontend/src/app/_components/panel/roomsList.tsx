"use client";

import { useState, useEffect } from "react";
import { Lock, Users, Monitor, Eye } from "lucide-react";

import { ApiRoom, ApiRoomsList } from "@/_utils/api-types";
import "./roomsList.css";
import "@/_utils/theme.css";

function normalizeString(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
}

function Ping({ error }: { error: boolean }) {
    return (
        <div className={`ping ${error ? "red" : "blue"}`}></div>
    );
}

function Badges({ features, available, id }: { features: ("visio" | "badge" | "video" | "ilot")[], available: boolean, id: string }) {
    return (
        <div className="badges">
            {features.map(feature => {
                switch (feature) {
                    case "visio":
                        return <Eye size={14} key={`feature visio ${id}`} />
                    case "badge":
                        return <Lock size={14} key={`feature badge ${id}`} />
                    case "video":
                        return <Monitor size={14} key={`feature video ${id}`} />
                    case "ilot":
                        return <Users size={14} key={`feature ilot ${id}`} />
                }
            })}
            <Ping error={available ? false : true}></Ping>
        </div>
    );
}

export default function RoomsList({ containerClassName, onRoomClick, roomsList, filter }: { containerClassName: string, onRoomClick: (room: ApiRoom) => void, roomsList: ApiRoomsList, filter: string }) {
    const [filteredRoomsList, setFilteredRoomsList] = useState(roomsList);

    useEffect(() => {
        if (roomsList) {
            const filtered = roomsList.filter(room =>
                normalizeString(room.name).includes(normalizeString(filter)) || normalizeString(room.building).includes(normalizeString(filter))
            );
            setFilteredRoomsList(filtered);
        }
    }, [filter, roomsList]);

    return (
        <div className={`results ${containerClassName}`}>
            {filteredRoomsList.length > 0 ? filteredRoomsList.map((room: ApiRoom) => (
                <div
                    key={room.id}
                    className="result"
                    onClick={() => {
                        try {
                            window.navigator.vibrate(10);
                        } finally {
                            onRoomClick(room);
                        }
                    }}
                >
                    <p>
                        {room.alias != "" ? `${room.alias.toUpperCase()} ` : `${room.name.toUpperCase()} `}
                        <span className="bat">{room.building}</span>
                    </p>
                    <Badges features={room.features} id={room.name} available={room.available} />
                </div>
            )) : <p className="no-results">Aucune salle n&apos;a été trouvée.</p>}
        </div>
    );
}

RoomsList.defaultProps = { containerClassName: "", onClick: ((room: ApiRoom) => { return room }), roomsList: [], filter: "" };