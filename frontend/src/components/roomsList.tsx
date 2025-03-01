import { ApiRoomType } from "@/app/types";

function normalizeString(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
}

export default function RoomsList({ containerClassName, onRoomClick, roomsList, filter }: { containerClassName: string, onRoomClick: (room: ApiRoomType) => void, roomsList: ApiRoomType[], filter: string }) {
    return (
        <div className={`results ${containerClassName}`}>
            {roomsList.length > 0 ? roomsList.map((room: ApiRoomType) => (
                <div
                    key={room.id}
                    className={`result ${(normalizeString(room.name).includes(normalizeString(filter)) || normalizeString(room.building).includes(normalizeString(filter))) ? "" : "hidden"}`}
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
                        {room.features.map(feature => <img key={feature} alt={feature} src={`/${feature}.svg`}></img>)}
                        <div className={room.available ? "ping blue" : "ping red"}></div>
                    </div>
                </div>
            )) : <p className="no-results" style={{ display: "block" }}>Aucune salle n'a été trouvée.</p>}
            {/* TODO: display the no result component */}
            {/* <p className="no-results" style={{ display: document.querySelectorAll('.result:not(.hidden)').length == 0 ? "block" : "none" }}>Aucune salle n'a été trouvée.</p> */}
        </div>
    );
}

RoomsList.defaultProps = { containerClassName: "", onClick: ((room: ApiRoomType) => { }), roomsList: [], filter: "" };