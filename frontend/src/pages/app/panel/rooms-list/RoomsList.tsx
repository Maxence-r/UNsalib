import { Lock, Users, Monitor, Eye } from "lucide-react";
import { cloneElement } from "react";

import type { ApiRoom } from "../../../../utils/api-types.js";
import "./RoomsList.css";

// function Ping({ error }: { error: boolean }) {
//     return <div className={`ping ${error ? "red" : "blue"}`}></div>;
// }

const FEATURES_ICONS = {
    visio: <Eye />,
    badge: <Lock />,
    video: <Monitor />,
    ilot: <Users />,
};

function Features({
    features,
    // available,
    id,
}: {
    features: ("visio" | "badge" | "video" | "ilot")[];
    // available: boolean;
    id: string;
}) {
    return (
        <div className="features">
            {features.map((feature) =>
                cloneElement(FEATURES_ICONS[feature], {
                    size: 14,
                    strokeWidth: 2.25,
                    key: feature + id,
                }),
            )}
            {/* <Ping error={available ? false : true}></Ping> */}
        </div>
    );
}

function Result({
    room,
    onRoomClick,
}: {
    room: ApiRoom | null;
    onRoomClick: (room: ApiRoom) => void;
}) {
    const handleRoomClick = () => {
        if (room) onRoomClick(room);
    };

    return room ? (
        <div className="result" onClick={handleRoomClick}>
            <p>
                {room.name.toUpperCase()}
                <span className="building">{room.building}</span>
            </p>
            <Features
                features={room.features}
                id={room.id}
                // available={room.available}
            />
        </div>
    ) : (
        <div className="result loading">
            <span className="placeholder" />
            <span className="placeholder actions" />
        </div>
    );
}

function RoomsList({
    onRoomClick,
    rooms,
    filter,
}: {
    onRoomClick: (room: ApiRoom) => void;
    rooms: ApiRoom[];
    filter: string[];
}) {
    const filteredRoomsList = rooms.filter((room) => filter.includes(room.id));

    return (
        <div className="results">
            {filteredRoomsList.length > 0 ? (
                filteredRoomsList.map((room) => (
                    <Result
                        key={room.id}
                        onRoomClick={onRoomClick}
                        room={room}
                    />
                ))
            ) : filter.length != rooms.length ? (
                <p className="no-results">Aucune salle n&apos;a été trouvée.</p>
            ) : (
                [...Array(100)].map((_val, i) => (
                    <Result key={i} onRoomClick={onRoomClick} room={null} />
                ))
            )}
        </div>
    );
}

export { RoomsList };
