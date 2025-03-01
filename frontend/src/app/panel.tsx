"use client";
import { useState, useEffect } from "react";
import Button from "@/components/button";
import Input from "@/components/input";
import { RoomsListType } from "./types";
import { useModalStore, usePanelStore, useSelectedRoomStore, useToastStore } from './store';

function normalizeString(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s]/g, "");
}

function SearchAvailableModalContent({ availableRoomsListHook }: { availableRoomsListHook: any }) {
    const closeModal = useModalStore((state) => state.close);
    const showToast = useToastStore((state) => state.open);
    const setToastContent = useToastStore((state) => state.setContent);
    const setToastAsError = useToastStore((state) => state.setError);
    const [searchLaunched, launchSearch] = useState(false);
    const [type, setType] = useState("");
    const [visioFeature, setVisioFeature] = useState(false);
    const [ilotFeature, setIlotFeature] = useState(false);
    const [nobadgeFeature, setNobadgeFeature] = useState(false);
    const [seats, setSeats] = useState(6);
    const [whiteBoards, setWhiteBoards] = useState(0);
    const [blackBoards, setBlackBoards] = useState(0);

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const [startHour, setStartHour] = useState(now.getHours().toString().padStart(2, '0'));
    const [startMinute, setStartMinute] = useState(now.getMinutes().toString().padStart(2, '0'));
    const [endHour, setEndHour] = useState(oneHourLater.getHours().toString().padStart(2, '0'));
    const [endMinute, setEndMinute] = useState(oneHourLater.getMinutes().toString().padStart(2, '0'));
    const [day, setDay] = useState(now.getDate().toString().padStart(2, '0'));
    const [month, setMonth] = useState((now.getMonth() + 1).toString().padStart(2, '0'));

    useEffect(() => {
        async function render() {
            launchSearch(true);

            let startHourNumber = parseInt(startHour, 10);
            let startMinuteNumber = parseInt(startMinute, 10);
            let endHourNumber = parseInt(endHour, 10);
            let endMinuteNumber = parseInt(endMinute, 10);
            let dayNumber = parseInt(day, 10);
            let monthNumber = parseInt(month, 10);

            // Validate inputs
            const errors = [];
            if (isNaN(startHourNumber) || startHourNumber < 0 || startHourNumber > 23) errors.push('Heure de départ invalide.');
            if (isNaN(startMinuteNumber) || startMinuteNumber < 0 || startMinuteNumber > 59) errors.push('Minute de départ invalide.');
            if (isNaN(endHourNumber) || endHourNumber < 0 || endHourNumber > 23) errors.push('Heure de fin invalide.');
            if (isNaN(endMinuteNumber) || endMinuteNumber < 0 || endMinuteNumber > 59) errors.push('Minute de fin invalide.');
            if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) errors.push('Jour invalide.');
            if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) errors.push('Mois invalide.');

            // Check that start time is not after end time
            const year = new Date().getFullYear();
            const startDateTime = new Date(year, monthNumber - 1, dayNumber, startHourNumber, startMinuteNumber);
            const endDateTime = new Date(year, monthNumber - 1, dayNumber, endHourNumber, endMinuteNumber);

            if (startDateTime > endDateTime) errors.push('L\'heure de fin doit être après l\'heure de début.');

            if (errors.length > 0) {
                setToastContent(errors.join(' '));
                setToastAsError(true);
                showToast();

                launchSearch(false);
                return;
            }

            // Format numbers with leading zeros
            const pad = (num: number) => num.toString().padStart(2, '0');

            const dateString = `${year}-${pad(monthNumber)}-${pad(dayNumber)}`;
            const startTime = `${pad(startHourNumber)}:${pad(startMinuteNumber)}:00+01:00`;
            const endTime = `${pad(endHourNumber)}:${pad(endMinuteNumber)}:00+01:00`;
            const debut = `${dateString}T${startTime}`;
            const fin = `${dateString}T${endTime}`;

            let nobadgeUrl = nobadgeFeature ? "true" : "";
            let featuresUrl = "";
            if (visioFeature) {
                featuresUrl += "visio";
                featuresUrl += ilotFeature ? "-ilot" : "";
            } else {
                featuresUrl += ilotFeature ? "ilot" : "";
            }

            try {
                const response = await fetch(
                    `http://localhost:9000/api/rooms/available?start=${encodeURIComponent(debut)}&end=${encodeURIComponent(fin)}&type=${type}&features=${featuresUrl}&nobadge=${nobadgeUrl}&seats=${seats.toString()}&whiteboards=${whiteBoards.toString()}&blackboards=${blackBoards.toString()}`
                );
                const coursesData = await response.json();

                if (coursesData) {
                    availableRoomsListHook(coursesData)
                }
            } catch (e) {
                console.error(e);
            } finally {
                launchSearch(false);
                closeModal();
            }
        }

        if (searchLaunched) {
            render();
        }
    }, [searchLaunched]);

    return (
        <div className="filter-rooms">
            <div className="option">
                <div className="setDate">
                    <div className="picker-container">
                        <p>Chercher de :</p>
                        <div className="time-picker">
                            <input type="number" max="24" maxLength={2} className="time" placeholder="--" value={startHour} onChange={(event) => setStartHour(event.target.value)} />
                            <p>:</p>
                            <input type="number" max="59" maxLength={2} className="time" placeholder="--" value={startMinute} onChange={(event) => setStartMinute(event.target.value)} />
                            <p style={{ margin: "0 4px" }}>à</p>
                            <input type="number" max="24" maxLength={2} className="time" placeholder="--" value={endHour} onChange={(event) => setEndHour(event.target.value)} />
                            <p>:</p>
                            <input type="number" max="59" maxLength={2} className="time" placeholder="--" value={endMinute} onChange={(event) => setEndMinute(event.target.value)} />
                        </div>
                    </div>
                    <div className="picker-container">
                        <p>Le :</p>
                        <div className="time-picker">
                            <input type="number" max="31" maxLength={2} className="time" placeholder="--" value={day} onChange={(event) => setDay(event.target.value)} />
                            <p>/</p>
                            <input type="number" max="12" maxLength={2} className="time" placeholder="--" value={month} onChange={(event) => setMonth(event.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="option">
                <p>Avec au moins <span className="numb" data-ref="placesAssises" id="places">{seats}</span> places assises</p>
                <div className="slidecontainer">
                    <input type="range" min="2" max="100" value={seats} className="slider" id="placesAssises" onChange={(event) => setSeats(parseFloat(event.target.value))} />
                </div>
            </div>

            <div className="option">
                <p>Avec au moins :</p>
                <div className="sliders">
                    <div className="slide-selector">
                        <p><span className="numb" data-ref="blanc">{whiteBoards}</span> {whiteBoards > 1 ? "tableaux blancs" : "tableau blanc"}</p>
                        <div className="slidecontainer">
                            <input type="range" min="0" max="4" value={whiteBoards} className="slider" id="blanc" onChange={(event) => setWhiteBoards(parseFloat(event.target.value))} />
                        </div>
                    </div>
                    <div className="slide-selector">
                        <p><span className="numb" id="places" data-ref="noir">{blackBoards}</span> {blackBoards > 1 ? "tableaux noirs" : "tableau noir"}</p>
                        <div className="slidecontainer">
                            <input type="range" min="0" max="4" value={blackBoards} className="slider" id="noir" onChange={(event) => setBlackBoards(parseFloat(event.target.value))} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="option">
                <p>Caractéristiques :</p>
                <div className="tags" id="caracteristiques">
                    <div
                        className={`tag ${visioFeature ? "selected" : ""}`}
                        onClick={() => { if (visioFeature) setVisioFeature(false); else setVisioFeature(true); }}
                    >
                        <p>VISIOCONFÉRENCE</p>
                    </div>
                    <div
                        className={`tag ${ilotFeature ? "selected" : ""}`}
                        onClick={() => { if (ilotFeature) setIlotFeature(false); else setIlotFeature(true); }}
                    >
                        <p>ILOT</p>
                    </div>
                    <div
                        className={`tag ${nobadgeFeature ? "selected" : ""}`}
                        onClick={() => { if (nobadgeFeature) setNobadgeFeature(false); else setNobadgeFeature(true); }}
                    >
                        <p>ACCÈS SANS BADGE</p>
                    </div>
                </div>
            </div>
            <div className="option">
                <p>Type :</p>
                <div className="tags" id="type">
                    <div
                        className={`tag ${type == "info" ? "selected" : ""}`}
                        onClick={() => { if (type == "info") setType(""); else setType("info"); }}
                    >
                        <p>INFORMATIQUE</p>
                    </div>
                    <div
                        className={`tag ${type == "tp" ? "selected" : ""}`}
                        onClick={() => { if (type == "tp") setType(""); else setType("tp"); }}
                    >
                        <p>TP</p>
                    </div>
                    <div
                        className={`tag ${type == "td" ? "selected" : ""}`}
                        onClick={() => { if (type == "td") setType(""); else setType("td"); }}
                    >
                        <p>TD</p>
                    </div>
                    <div
                        className={`tag ${type == "amphi" ? "selected" : ""}`}
                        onClick={() => { if (type == "amphi") setType(""); else setType("amphi"); }}
                    >
                        <p>AMPHITHÉÂTRE</p>
                    </div>
                </div>
            </div>
            <Button
                className={`search-button ${searchLaunched ? "button--loading" : ""}`}
                onClick={() => launchSearch(true)}
            >Rechercher</Button>
        </div>
    )
}

function RoomsList({ roomsList }: { roomsList: RoomsListType[] }) {
    const [activeTab, setActiveTab] = useState("edt-finder");
    const [search, setSearch] = useState("");
    const [availableRoomsList, setAvailableRoomsList] = useState([]);
    const openModal = useModalStore((state) => state.open);
    const setModalContent = useModalStore((state) => state.setContent);
    const closePanel = usePanelStore((state) => state.close);
    const setSelectedRoom = useSelectedRoomStore((state) => state.setRoom);

    return (
        <>
            <div className="actions_selector">
                <div onClick={() => setActiveTab("edt-finder")} data-ref="edt-finder" className={`action ${activeTab == "edt-finder" ? "tab-active" : ""}`}>
                    EDT des salles
                </div>
                <div onClick={() => setActiveTab("room-finder")} data-ref="room-finder" className={`action ${activeTab == "room-finder" ? "tab-active" : ""}`}>
                    Trouver une salle
                </div>
            </div>

            <div className="actions_container">

                <div className={`edt-finder ${activeTab == "edt-finder" ? "displayed" : ""}`}>
                    <Input
                        className="search"
                        type="text"
                        placeholder="Rechercher une salle, un bâtiment..."
                        onInput={(event) => {
                            setSearch(normalizeString((event.target as HTMLInputElement).value.toString()))
                        }}
                    ></Input>
                    <div className="results-head">
                        <p>Résultats de recherche</p>
                        <div className="indicator">
                            <img src="/info.svg" />
                            <p>Pictos</p>
                        </div>
                    </div>
                    <div className="results edt">
                        {roomsList.map((room: RoomsListType) => (
                            <div
                                key={room.id}
                                className={`result ${activeTab == "edt-finder" && (normalizeString(room.name).includes(search) || normalizeString(room.building).includes(search)) ? "" : "hidden"}`}
                                onClick={() => {
                                    try {
                                        window.navigator.vibrate(10);
                                    } finally {
                                        closePanel();
                                        setSelectedRoom(room.id, room.name);
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
                        ))}
                        {/* TODO: display the no result component */}
                        {/* <p className="no-results" style={{ display: document.querySelectorAll('.result:not(.hidden)').length == 0 ? "block" : "none" }}>Aucune salle n'a été trouvée.</p> */}
                    </div>
                </div>

                <div className={`room-finder ${activeTab == "room-finder" ? "displayed" : ""}`}>
                    <div className="advanced-search">
                        <Button
                            className="filter-button"
                            onClick={() => {
                                setModalContent(<SearchAvailableModalContent availableRoomsListHook={setAvailableRoomsList}></SearchAvailableModalContent>);
                                openModal();
                            }}
                        >
                            Chercher une salle libre
                        </Button>
                    </div>
                    <Input
                        className="search"
                        type="text"
                        placeholder="Filtrer par salle, bâtiment..."
                        onInput={(event) => {
                            setSearch(normalizeString((event.target as HTMLInputElement).value.toString()))
                        }}
                    ></Input>
                    <div className="results-head">
                        <p>Résultats de recherche</p>
                        <div className="indicator">
                            <img src="/info.svg" />
                            <p>Pictos</p>
                        </div>
                    </div>

                    <div className="results available">
                        {availableRoomsList.map((room: RoomsListType) => (
                            <div
                                key={room.id}
                                className={`result ${activeTab == "room-finder" && (normalizeString(room.name).includes(search) || normalizeString(room.building).includes(search)) ? "" : "hidden"}`}
                                onClick={() => {
                                    try {
                                        window.navigator.vibrate(10);
                                    } finally {
                                        closePanel();
                                        setSelectedRoom(room.id, room.name);
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
                        ))}
                        {/* TODO: display the no result component */}
                        {/* <p className="no-results">Aucune salle n'a été trouvée.</p> */}
                    </div>
                </div >
            </div >
        </>
    )
}

export default function Panel({ roomsList }: { roomsList: RoomsListType[] }) {
    const isPanelOpened = usePanelStore((state) => state.isOpened);

    return (
        <div tabIndex={-1} className={`pannel ${isPanelOpened ? "" : "hidden"}`}>
            <div className="campus">
                <div className="campus_selector">
                    <p>SCIENCES ET TECHNIQUES</p>
                    <div className="version">V1.0</div>
                </div>
                <div className="campus_feed">
                    <img src="/lsh.png" alt="placeholder" />

                    <div className="overlay"></div>
                    <div className="campus_feed_content">
                        <p>ICI S'AFFICHERA LA MISE À JOUR DES GROUPES</p>
                    </div>
                </div>
            </div>
            {roomsList.length > 0 ? <RoomsList roomsList={roomsList}></RoomsList> : <div>Impossible de charger les salles</div>}
        </div>
    )
}