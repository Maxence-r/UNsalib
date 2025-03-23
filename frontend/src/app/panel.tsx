"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import Button from "@/components/button";
import Input from "@/components/input";
import { ApiRoomType } from "./_utils/types";
import {
    useModalStore,
    usePanelStore,
    useSelectedRoomStore,
    useToastStore,
    useHistoryStore
} from './_utils/store';
import RoomsList from "@/components/roomsList";
import Image from "next/image";
import { socket } from "../socket";
import PWAInstallButton from "./installButton";

const APP_VERSION = "v2.0";

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
                    console.log(coursesData)
                    availableRoomsListHook(coursesData)
                }
            } catch (e) {
                console.error(e);
                setToastContent("Impossible de rechercher une salle pour l'instant. Réessayez plus tard.");
                setToastAsError(true);
                showToast();
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

function AboutModalContent() {
    return (
        <div className="about">
            <div className="modal-section">
                <h4 className="title"><Image src="/book.svg" width={24} height={24} alt=""></Image>À PROPOS<span id="version">{APP_VERSION}</span></h4>
                <div className="content">
                    <p><strong>UNsalib</strong> est un site web qui permet aux étudiants et professeurs de Nantes Université de <strong>trouver les salles libres</strong> du campus et d&apos;afficher leurs <strong>emplois du temps</strong>.</p>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title"><Image src="/team.svg" width={24} height={24} alt=""></Image>L&apos;ÉQUIPE</h4>
                <div className="content">
                    <p>Nous sommes trois étudiants motivés pour améliorer le quotidien de tous au sein de l&apos;Université.</p>
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
                            <Image src="/mael.png" width={64} height={64} alt=""></Image>
                        </div>
                        <div className="item">
                            <div className="infos">
                                <h2>Ethann</h2>
                                <p>Admin DB & testeur</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title"><Image src="/smile.svg" width={24} height={24} alt=""></Image>REMERCIEMENTS</h4>
                <div className="content">
                    <p>Merci à <strong>Christophe Lino</strong> pour sa confiance et son implication dans le projet, et par ailleurs pour avoir été le premier professeur à utiliser UNsalib.</p>
                    <p>Merci aussi à <strong>tous ceux qui nous ont encouragés</strong> et qui nous soutiennent dans cette aventure, en particulier Mewenn pour nous avoir fait part de l&apos;insalubrité de notre application...</p>
                    <p>Merci enfin à <strong>Nantes Université</strong> d&apos;avoir publié les emplois du temps des différentes formations en libre accès.</p>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title"><Image src="/link.svg" width={24} height={24} alt=""></Image>LIENS</h4>
                <div className="content">
                    <div className="grid">
                        <div className="item">
                            <div className="infos">
                                <h2>White Paper</h2>
                                <p>Infos de conception</p>
                            </div>
                            <button onClick={() => window.open("/white-paper.pdf", "_blank")}>
                                <Image src="/open.svg" width={24} height={24} alt="Ouvrir le whitepaper"></Image>
                            </button>
                        </div>
                        <div className="item">
                            <div className="infos">
                                <h2>Github</h2>
                                <p>Code source</p>
                            </div>
                            <button onClick={() => window.open("https://github.com/Maxence-r/UNsalib_Modern-Timetable-Viewer", "_blank")}>
                                <Image src="/open.svg" width={24} height={24} alt="Ouvrir le repo Github"></Image>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabView({ roomsList }: { roomsList: ApiRoomType[] }) {
    const [activeTab, setActiveTab] = useState("edt-finder");
    const [timetableTabSearch, setTimetableTabSearch] = useState("");
    const [availableTabSearch, setAvailableTabSearch] = useState("");
    const [availableRoomsList, setAvailableRoomsList] = useState([]);
    const historyStackPush = useHistoryStore((state) => state.push);
    const historyStackPop = useHistoryStore((state) => state.pop);
    const historyStack = useHistoryStore((state) => state.stack);
    const openModal = useModalStore((state) => state.open);
    const setModalContent = useModalStore((state) => state.setContent);
    const closePanel = usePanelStore((state) => state.close);
    const setSelectedRoom = useSelectedRoomStore((state) => state.setRoom);

    function loadTimetable(room: ApiRoomType) {
        closePanel();
        setSelectedRoom(room.id, room.name);
    }

    useEffect(() => {
        if (activeTab != "edt-finder") {
            window.history.pushState({ tabClicked: true }, "");
            historyStackPush("tabClicked");

            const handlePopState = () => {
                if (historyStack[historyStack.length - 1] == "tabClicked" && activeTab != "edt-finder") {
                    historyStackPop();
                    setActiveTab("edt-finder");
                }
            };

            window.addEventListener("popstate", handlePopState);

            return () => window.removeEventListener("popstate", handlePopState);
        }
    }, [activeTab, setActiveTab]);

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
                        <div
                            className="indicator"
                            onClick={() => {
                                setModalContent(<AboutPictosModalContent></AboutPictosModalContent>);
                                openModal();
                            }}
                        >
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
                        <div
                            className="indicator"
                            onClick={() => {
                                setModalContent(<AboutPictosModalContent></AboutPictosModalContent>);
                                openModal();
                            }}
                        >
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

function AboutPictosModalContent() {
    const closeModal = useModalStore((state) => state.close);

    return (
        <div className="pictos">
            <div className="option">
                <p>Salle info/vidéo</p>
                <Image src="/video.svg" width={25} height={25} alt="video"></Image>
            </div>
            <div className="option">
                <p>Salle de visioconférence</p>
                <Image src="/visio.svg" width={25} height={25} alt="visio"></Image>
            </div>
            <div className="option">
                <p>Salle en ilot</p>
                <Image src="/ilot.svg" width={25} height={25} alt="ilot"></Image>
            </div>
            <div className="option">
                <p>Salle à badge</p>
                <Image src="/badge.svg" width={25} height={25} alt="badge"></Image>
            </div>

            <Button onClick={() => closeModal()}>Compris !</Button>
        </div>
    );
}

export default function Panel({ roomsList }: { roomsList: ApiRoomType[] }) {
    const isPanelOpened = usePanelStore((state) => state.isOpened);
    const openModal = useModalStore((state) => state.open);
    const setModalContent = useModalStore((state) => state.setContent);
    const [updatedGroupsList, setUpdatedGroupsList] = useState(["ICI S'AFFICHERA LA MISE À JOUR DES GROUPES"]);

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

        function onGroupUpdated(value: { message: string }) {
            setUpdatedGroupsList(previous => [...previous, value.message]);
        }

        function onError(error: string) {
            console.error("Socket.IO error:", error);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("groupUpdated", onGroupUpdated);
        socket.on("error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("groupUpdated", onGroupUpdated);
            socket.off("error", onError);
        };
    }, []);

    return (
        <div tabIndex={-1} className={`panel ${isPanelOpened ? "" : "hidden"}`}>
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
                        <Image src="/info.svg" width={24} height={24} alt="Infos sur l'application"></Image>
                    </div>
                    <PWAInstallButton></PWAInstallButton>
                </div>
                <div className="campus_feed">
                    <Image src="/campus_st.jpg" width={680} height={346} alt=""></Image>

                    <div className="overlay"></div>
                    <div className="campus_feed_content">
                        {
                            updatedGroupsList.map(groupMsg => {
                                return <p key={groupMsg + new Date().toISOString}>{groupMsg}</p>
                            })
                        }
                    </div>
                </div>
            </div>
            <TabView roomsList={roomsList}></TabView>
        </div>
    )
}