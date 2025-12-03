import { Lock, Users, Monitor, Eye } from "lucide-react";

import type { ApiRoom } from "../../../../utils/api-types.js";
import "./RoomsList.css";

// function Ping({ error }: { error: boolean }) {
//     return <div className={`ping ${error ? "red" : "blue"}`}></div>;
// }

function Badges({
    features,
    // available,
    id,
}: {
    features: ("visio" | "badge" | "video" | "ilot")[];
    // available: boolean;
    id: string;
}) {
    return (
        <div className="badges">
            {features.map((feature) => {
                switch (feature) {
                    case "visio":
                        return <Eye size={14} key={`feature visio ${id}`} />;
                    case "badge":
                        return <Lock size={14} key={`feature badge ${id}`} />;
                    case "video":
                        return (
                            <Monitor size={14} key={`feature video ${id}`} />
                        );
                    case "ilot":
                        return <Users size={14} key={`feature ilot ${id}`} />;
                }
            })}
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
    return (
        <div
            className="result"
            onClick={() => {
                try {
                    window.navigator.vibrate(10);
                } finally {
                    if (room) onRoomClick(room);
                }
            }}
        >
            {room ? (
                <>
                    <p>
                        {`${room.name.toUpperCase()} `}
                        <span className="bat">{room.building}</span>
                    </p>
                    <Badges
                        features={room.features}
                        id={room.name}
                        // available={room.available}
                    />
                </>
            ) : (
                <>
                    <span className="placeholder" />
                    <span className="placeholder actions" />
                </>
            )}
        </div>
    );
}

export default function RoomsList({
    onRoomClick,
    rooms,
    filter,
}: {
    onRoomClick: (room: ApiRoom) => void;
    rooms: ApiRoom[];
    filter: string[];
}) {
    const filteredRoomsList = rooms.filter((room) => {
        return filter.includes(room.id);
        // normalizeString(room.name).includes(normalizeString(filter)) ||
        //     normalizeString(room.building).includes(normalizeString(filter));
    });

    return (
        <div className={`results`}>
            {filteredRoomsList.length > 0 ? (
                filteredRoomsList.map((room) => (
                    <Result
                        key={room.id}
                        onRoomClick={onRoomClick}
                        room={room}
                    />
                ))
            ) : filter ? (
                <p className="no-results">Aucune salle n&apos;a été trouvée.</p>
            ) : (
                [...Array(100)].map((_val, i) => (
                    <Result
                        key={i}
                        onRoomClick={onRoomClick}
                        room={null}
                    />
                ))
            )}
        </div>
    );
}
