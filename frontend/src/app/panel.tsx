"use client";
import { useState, useEffect } from "react";
import Button from "@/components/button";
import Input from "@/components/input";
import { ApiRoomType } from "./types";
import { useModalStore, usePanelStore, useSelectedRoomStore, useToastStore } from './store';
import RoomsList from "@/components/roomsList";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

const APP_VERSION = "v2.0"

function SearchAvailableModalContent({ availableRoomsListHook }: { availableRoomsListHook: Dispatch<SetStateAction<never[]>> }) {
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

            const startHourNumber = parseInt(startHour, 10);
            const startMinuteNumber = parseInt(startMinute, 10);
            const endHourNumber = parseInt(endHour, 10);
            const endMinuteNumber = parseInt(endMinute, 10);
            const dayNumber = parseInt(day, 10);
            const monthNumber = parseInt(month, 10);

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

            const nobadgeUrl = nobadgeFeature ? "true" : "";
            let featuresUrl = "";
            if (visioFeature) {
                featuresUrl += "visio";
                featuresUrl += ilotFeature ? "-ilot" : "";
            } else {
                featuresUrl += ilotFeature ? "ilot" : "";
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/rooms/available?start=${encodeURIComponent(debut)}&end=${encodeURIComponent(fin)}&type=${type}&features=${featuresUrl}&nobadge=${nobadgeUrl}&seats=${seats.toString()}&whiteboards=${whiteBoards.toString()}&blackboards=${blackBoards.toString()}`
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

function TabView({ roomsList }: { roomsList: ApiRoomType[] }) {
    const [activeTab, setActiveTab] = useState("edt-finder");
    const [timetableTabSearch, setTimetableTabSearch] = useState("");
    const [availableTabSearch, setAvailableTabSearch] = useState("");
    const [availableRoomsList, setAvailableRoomsList] = useState([]);
    const openModal = useModalStore((state) => state.open);
    const setModalContent = useModalStore((state) => state.setContent);
    const closePanel = usePanelStore((state) => state.close);
    const setSelectedRoom = useSelectedRoomStore((state) => state.setRoom);

    function loadTimetable(room: ApiRoomType) {
        closePanel();
        setSelectedRoom(room.id, room.name);
    }

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
                        onInput={(event) => setTimetableTabSearch((event.target as HTMLInputElement).value.toString())}
                    ></Input>
                    <div className="results-head">
                        <p>Résultats de recherche</p>
                        <div className="indicator">
                            <Image src="/info.svg" width={24} height={24} alt="Infos sur les pictogrammes"></Image>
                            <p>Pictos</p>
                        </div>
                    </div>
                    <RoomsList containerClassName="edt" roomsList={roomsList} filter={timetableTabSearch} onRoomClick={loadTimetable}></RoomsList>
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
                        onInput={(event) => setAvailableTabSearch((event.target as HTMLInputElement).value.toString())}
                    ></Input>
                    <div className="results-head">
                        <p>Résultats de recherche</p>
                        <div className="indicator">
                            <Image src="/info.svg" width={24} height={24} alt="Infos sur les pictogrammes"></Image>
                            <p>Pictos</p>
                        </div>
                    </div>
                    <RoomsList containerClassName="available" roomsList={availableRoomsList} filter={availableTabSearch} onRoomClick={loadTimetable}></RoomsList>
                </div>
            </div>
        </>
    )
}

function AboutModalContent() {

    return (
        <div className="about">
            <div className="modal-section">
                <h4 className="title"><Image src="/arrow.svg" width={11} height={11} alt=""></Image>À PROPOS<span id="version">{APP_VERSION}</span></h4>
                <div className="content">
                    <p>UNsalib est un site web qui permet aux étudiants et professeurs de Nantes Université de trouver les salles libres du campus et d'afficher leurs emplois du temps.</p>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title"><Image src="/arrow.svg" width={11} height={11} alt=""></Image>L'ÉQUIPE</h4>
                <div className="content">
                    <p>Nous sommes trois étudiants motivés pour améliorer le quotidien de tous au sein de l'Université.</p>
                    <div className="grid" id="team">
                        <div className="item">
                            <div className="infos">
                                <h2>Maxence</h2>
                                <p>Développeur</p>
                            </div>
                            <Image src="/maxence.png" width={36} height={36} alt=""></Image>
                        </div>
                        <div className="item ">
                            <div className="infos">
                                <h2>Maël</h2>
                                <p>Développeur</p>
                            </div>
                            <Image src="/profile.png" width={36} height={36} alt=""></Image>
                        </div>
                        <div className="item">
                            <div className="infos">
                                <h2>Ethann</h2>
                                <p>Admin DB & Testeur</p>
                            </div>
                            <Image src="/profile.png" width={36} height={36} alt=""></Image>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title"><Image src="/arrow.svg" width={11} height={11} alt=""></Image>LIENS</h4>
                <div className="content">
                    <div className="grid">
                        <div className="item">
                            <div className="infos">
                                <h2>WhitePaper</h2>
                                <p>Infos de conception</p>
                            </div>
                            <button>
                                <Image src="/download.svg" width={24} height={24} alt="Ouvrir le whitepaper"></Image>
                            </button>
                        </div>
                        <div className="item">
                            <div className="infos">
                                <h2>Github</h2>
                                <p>Sources</p>
                            </div>
                            <button>
                                <Image src="/download.svg" width={24} height={24} alt="Ouvrir le whitepaper"></Image>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Panel({ roomsList }: { roomsList: ApiRoomType[] }) {
    const isPanelOpened = usePanelStore((state) => state.isOpened);
    const openModal = useModalStore((state) => state.open);
    const setModalContent = useModalStore((state) => state.setContent);

    return (
        <div tabIndex={-1} className={`pannel ${isPanelOpened ? "" : "hidden"}`}>
            <div className="campus">
                <div className="header">
                    <div className="campus_selector">
                        <Image src="/logo96.png" height={96} width={96} alt="Logo"></Image>
                        <p>SCIENCES ET TECHNIQUES</p>
                    </div>
                    <div className="version"
                        onClick={() => {
                            setModalContent(<AboutModalContent></AboutModalContent>);
                            openModal();
                        }}
                    >
                        <Image src="/info.svg" width={24} height={24} alt="Infos sur les pictogrammes"></Image>
                    </div>
                </div>
                <div className="campus_feed">
                    <Image src="/lsh.png" width={398} height={202} alt=""></Image>

                    <div className="overlay"></div>
                    <div className="campus_feed_content">
                        <p>ICI S&apos;AFFICHERA LA MISE À JOUR DES GROUPES</p>
                    </div>
                </div>
            </div>
            <TabView roomsList={roomsList}></TabView>
        </div>
    )
}