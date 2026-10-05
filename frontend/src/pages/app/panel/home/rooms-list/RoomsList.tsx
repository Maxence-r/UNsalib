import { Lock, Users, Monitor, Eye } from "lucide-react";
import { cloneElement, type ReactElement } from "react";
import { useNavigate } from "react-router";

import type { ApiDataRoom } from "../../../../../utils/types/api.type.js";
import "./RoomsList.css";
import { router } from "../../../../Router.js";
import { useDeviceType } from "../../../../../utils/hooks/device.hook.js";

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
}): ReactElement {
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
    room: ApiDataRoom | null;
    onRoomClick: (room: ApiDataRoom) => void;
}): ReactElement {
    const isMobile = useDeviceType() === "mobile";
    const navigate = useNavigate();

    const handleRoomClick = (): void => {
        navigate(
            `/app/timetable/${room?.id}${isMobile ? "?panel=hidden" : ""}`,
        );
    };

    return room ? (
        <div className="result" onClick={handleRoomClick}>
            <p>
                {room.name.toUpperCase()}
                <span className="building">{room.buildingName}</span>
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
    isLoading,
}: {
    onRoomClick: (room: ApiDataRoom) => void;
    rooms: ApiDataRoom[];
    filter: string[];
    isLoading: boolean;
}): ReactElement {
    const filteredRoomsList = rooms.filter((room) => filter.includes(room.id));

    return (
        <div className="results">
            {isLoading ? (
                [...Array(100)].map((_val, i) => (
                    <Result key={i} onRoomClick={onRoomClick} room={null} />
                ))
            ) : filteredRoomsList.length > 0 ? (
                filteredRoomsList.map((room) => (
                    <Result
                        key={room.id}
                        onRoomClick={onRoomClick}
                        room={room}
                    />
                ))
            ) : (
                <p className="no-results">Aucune salle n&apos;a été trouvée.</p>
            )}
        </div>
    );
}

export { RoomsList };
