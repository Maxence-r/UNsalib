import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

import { TextButton } from "../../../../components/button/Button.js";
import type { ApiRoomsList } from "../../../../utils/types/api.type.js";
import {
    showToast,
    setToastMessage,
} from "../../../../components/toast/Toast.js";
import { Modal } from "../../../../components/modal/Modal.js";
import "./SearchModal.css";

function SearchModal({
    availableRoomsListHook,
    isOpen,
    setIsOpen,
}: {
    availableRoomsListHook: Dispatch<SetStateAction<string[]>>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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

    const [startHour, setStartHour] = useState(
        now.getHours().toString().padStart(2, "0"),
    );
    const [startMinute, setStartMinute] = useState(
        now.getMinutes().toString().padStart(2, "0"),
    );
    const [endHour, setEndHour] = useState(
        oneHourLater.getHours().toString().padStart(2, "0"),
    );
    const [endMinute, setEndMinute] = useState(
        oneHourLater.getMinutes().toString().padStart(2, "0"),
    );
    const [day, setDay] = useState(now.getDate().toString().padStart(2, "0"));
    const [month, setMonth] = useState(
        (now.getMonth() + 1).toString().padStart(2, "0"),
    );

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
            if (
                isNaN(startHourNumber) ||
                startHourNumber < 0 ||
                startHourNumber > 23
            )
                errors.push("Heure de départ invalide.");
            if (
                isNaN(startMinuteNumber) ||
                startMinuteNumber < 0 ||
                startMinuteNumber > 59
            )
                errors.push("Minute de départ invalide.");
            if (isNaN(endHourNumber) || endHourNumber < 0 || endHourNumber > 23)
                errors.push("Heure de fin invalide.");
            if (
                isNaN(endMinuteNumber) ||
                endMinuteNumber < 0 ||
                endMinuteNumber > 59
            )
                errors.push("Minute de fin invalide.");
            if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31)
                errors.push("Jour invalide.");
            if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12)
                errors.push("Mois invalide.");

            // Check that start time is not after end time
            const year = new Date().getFullYear();
            const startDateTime = new Date(
                year,
                monthNumber - 1,
                dayNumber,
                startHourNumber,
                startMinuteNumber,
            );
            const endDateTime = new Date(
                year,
                monthNumber - 1,
                dayNumber,
                endHourNumber,
                endMinuteNumber,
            );

            if (startDateTime > endDateTime)
                errors.push("L'heure de fin doit être après l'heure de début.");

            if (errors.length > 0) {
                setToastMessage(errors.join(" "), true);
                showToast();

                launchSearch(false);
                return;
            }

            // Format numbers with leading zeros
            const pad = (num: number) => num.toString().padStart(2, "0");

            const dateString = `${year}-${pad(monthNumber)}-${pad(dayNumber)}`;
            const startTime = `${pad(startHourNumber)}:${pad(startMinuteNumber)}:00+01:00`;
            const endTime = `${pad(endHourNumber)}:${pad(endMinuteNumber)}:00+01:00`;
            const debut = `${dateString}T${startTime}`;
            const fin = `${dateString}T${endTime}`;

            let featuresUrl = "";
            if (visioFeature) {
                featuresUrl += "visio";
                featuresUrl += ilotFeature ? "-ilot" : "";
            } else {
                featuresUrl += ilotFeature ? "ilot" : "";
            }

            try {
                let urlString = `${
                    import.meta.env.VITE_BACKEND_URL
                }/rooms/available?start=${encodeURIComponent(
                    debut,
                )}&end=${encodeURIComponent(
                    fin,
                )}&seats=${seats.toString()}&whiteboards=${whiteBoards.toString()}&blackboards=${blackBoards.toString()}`;
                if (type) urlString += `&type=${type}`;
                if (nobadgeFeature) urlString += `&nobadge=true`;
                if (featuresUrl) urlString += `&features=${featuresUrl}`;

                const response = await fetch(urlString, {
                    credentials: "include",
                });
                const availableRooms: ApiRoomsList = await response.json();

                if (availableRooms) {
                    availableRoomsListHook(availableRooms);
                }
            } catch (e) {
                console.error(e);
                setToastMessage(
                    "Impossible de rechercher une salle pour l'instant. Réessayez plus tard.",
                    true,
                );
                showToast();
            } finally {
                launchSearch(false);
                // closeModal();
            }
        }

        if (searchLaunched) {
            render();
        }
    }, [searchLaunched]);

    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="filter-rooms">
                <div className="option">
                    <div className="setDate">
                        <div className="picker-container">
                            <p>Chercher de :</p>
                            <div className="time-picker">
                                <input
                                    type="number"
                                    max="24"
                                    maxLength={2}
                                    className="time"
                                    placeholder="--"
                                    value={startHour}
                                    onChange={(event) =>
                                        setStartHour(event.target.value)
                                    }
                                />
                                <p>:</p>
                                <input
                                    type="number"
                                    max="59"
                                    maxLength={2}
                                    className="time"
                                    placeholder="--"
                                    value={startMinute}
                                    onChange={(event) =>
                                        setStartMinute(event.target.value)
                                    }
                                />
                                <p style={{ margin: "0 4px" }}>à</p>
                                <input
                                    type="number"
                                    max="24"
                                    maxLength={2}
                                    className="time"
                                    placeholder="--"
                                    value={endHour}
                                    onChange={(event) =>
                                        setEndHour(event.target.value)
                                    }
                                />
                                <p>:</p>
                                <input
                                    type="number"
                                    max="59"
                                    maxLength={2}
                                    className="time"
                                    placeholder="--"
                                    value={endMinute}
                                    onChange={(event) =>
                                        setEndMinute(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="picker-container">
                            <p>Le :</p>
                            <div className="time-picker">
                                <input
                                    type="number"
                                    max="31"
                                    maxLength={2}
                                    className="time"
                                    placeholder="--"
                                    value={day}
                                    onChange={(event) =>
                                        setDay(event.target.value)
                                    }
                                />
                                <p>/</p>
                                <input
                                    type="number"
                                    max="12"
                                    maxLength={2}
                                    className="time"
                                    placeholder="--"
                                    value={month}
                                    onChange={(event) =>
                                        setMonth(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="option">
                    <p>
                        Avec au moins{" "}
                        <span
                            className="numb"
                            data-ref="placesAssises"
                            id="places"
                        >
                            {seats}
                        </span>{" "}
                        places assises
                    </p>
                    <div className="slidecontainer">
                        <input
                            type="range"
                            min="2"
                            max="100"
                            value={seats}
                            className="slider"
                            id="placesAssises"
                            onChange={(event) =>
                                setSeats(parseFloat(event.target.value))
                            }
                        />
                    </div>
                </div>

                <div className="option">
                    <p>Avec au moins :</p>
                    <div className="sliders">
                        <div className="slide-selector">
                            <p>
                                <span className="numb" data-ref="blanc">
                                    {whiteBoards}
                                </span>{" "}
                                {whiteBoards > 1
                                    ? "tableaux blancs"
                                    : "tableau blanc"}
                            </p>
                            <div className="slidecontainer">
                                <input
                                    type="range"
                                    min="0"
                                    max="4"
                                    value={whiteBoards}
                                    className="slider"
                                    id="blanc"
                                    onChange={(event) =>
                                        setWhiteBoards(
                                            parseFloat(event.target.value),
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="slide-selector">
                            <p>
                                <span
                                    className="numb"
                                    id="places"
                                    data-ref="noir"
                                >
                                    {blackBoards}
                                </span>{" "}
                                {blackBoards > 1
                                    ? "tableaux noirs"
                                    : "tableau noir"}
                            </p>
                            <div className="slidecontainer">
                                <input
                                    type="range"
                                    min="0"
                                    max="4"
                                    value={blackBoards}
                                    className="slider"
                                    id="noir"
                                    onChange={(event) =>
                                        setBlackBoards(
                                            parseFloat(event.target.value),
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="option">
                    <p>Caractéristiques :</p>
                    <div className="tags" id="caracteristiques">
                        <div
                            className={`tag ${visioFeature ? "selected" : ""}`}
                            onClick={() => {
                                if (visioFeature) setVisioFeature(false);
                                else setVisioFeature(true);
                            }}
                        >
                            <p>VISIOCONFÉRENCE</p>
                        </div>
                        <div
                            className={`tag ${ilotFeature ? "selected" : ""}`}
                            onClick={() => {
                                if (ilotFeature) setIlotFeature(false);
                                else setIlotFeature(true);
                            }}
                        >
                            <p>ILOT</p>
                        </div>
                        <div
                            className={`tag ${nobadgeFeature ? "selected" : ""}`}
                            onClick={() => {
                                if (nobadgeFeature) setNobadgeFeature(false);
                                else setNobadgeFeature(true);
                            }}
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
                            onClick={() => {
                                if (type == "info") setType("");
                                else setType("info");
                            }}
                        >
                            <p>INFORMATIQUE</p>
                        </div>
                        <div
                            className={`tag ${type == "tp" ? "selected" : ""}`}
                            onClick={() => {
                                if (type == "tp") setType("");
                                else setType("tp");
                            }}
                        >
                            <p>TP</p>
                        </div>
                        <div
                            className={`tag ${type == "td" ? "selected" : ""}`}
                            onClick={() => {
                                if (type == "td") setType("");
                                else setType("td");
                            }}
                        >
                            <p>TD</p>
                        </div>
                        <div
                            className={`tag ${type == "amphi" ? "selected" : ""}`}
                            onClick={() => {
                                if (type == "amphi") setType("");
                                else setType("amphi");
                            }}
                        >
                            <p>AMPHITHÉÂTRE</p>
                        </div>
                    </div>
                </div>
                <TextButton
                    className="search-button"
                    onClick={() => launchSearch(true)}
                    isLoading={searchLaunched}
                    text="Rechercher"
                />
            </div>
        </Modal>
    );
}

export { SearchModal };
