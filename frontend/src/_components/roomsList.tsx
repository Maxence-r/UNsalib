
"use client";
import { ApiRoomType } from "@/app/_utils/types";
import Image from "next/image";
import Ping from "./ping";
import "./roomsList.css";
import "@/_utils/theme.css";
import { useState, useEffect } from "react";

function normalizeString(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
}

export default function RoomsList({ containerClassName, onRoomClick, roomsList, filter }: { containerClassName: string, onRoomClick: (room: ApiRoomType) => void, roomsList: ApiRoomType[], filter: string }) {    
    const [filteredRoomsList, setFilteredRoomsList] = useState(roomsList);
    
    useEffect(() => {
		const filtered = roomsList.filter(room =>
            normalizeString(room.name).includes(normalizeString(filter)) || normalizeString(room.building).includes(normalizeString(filter))
		);
		setFilteredRoomsList(filtered);
	}, [filter, roomsList]);
    
    return (
        <div className={`results ${containerClassName}`}>
            {filteredRoomsList.length > 0 ? filteredRoomsList.map((room: ApiRoomType) => (
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
                    <div className="badges">
                        {room.features.map(feature => <Image key={feature} alt={feature} width={25} height={25} src={`/${feature}.svg`}></Image>)}
                        <Ping error={room.available ? false : true}></Ping>
                    </div>
                </div>
            )) : <p className="no-results">Aucune salle n&apos;a été trouvée.</p>}
        </div>
    );
}

RoomsList.defaultProps = { containerClassName: "", onClick: ((room: ApiRoomType) => { return room }), roomsList: [], filter: "" };