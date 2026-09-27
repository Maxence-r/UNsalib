// import { useState, useEffect, type ReactElement } from "react";

// import { TextButton } from "../../../../../components/button/Button.js";
// import type { ApiDataRoom } from "../../../../../utils/types/api.type.js";
// import "./SearchModal.css";
// import { useToast } from "../../../../../components/toast/Toast.js";
// import { Switch, SwitchView } from "../../../../../components/switch/Switch.js";
// import { DateTimePicker } from "../../../../../components/date-time-picker/DateTimePicker.js";

// function SearchModal({
//     close,
// }: {
//     // availableRoomsListHook: Dispatch<SetStateAction<string[]>>;
//     close?: () => void;
// }): ReactElement {
//     const [searchLaunched, launchSearch] = useState(false);
//     const [type, setType] = useState("");
//     const [visioFeature, setVisioFeature] = useState(false);
//     const [ilotFeature, setIlotFeature] = useState(false);
//     const [nobadgeFeature, setNobadgeFeature] = useState(false);
//     const [seats, setSeats] = useState(6);
//     const [whiteBoards, setWhiteBoards] = useState(0);
//     const [blackBoards, setBlackBoards] = useState(0);

//     const { open: openToast } = useToast();

//     const now = new Date();
//     const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

//     const [startHour, setStartHour] = useState(
//         now.getHours().toString().padStart(2, "0"),
//     );
//     const [startMinute, setStartMinute] = useState(
//         now.getMinutes().toString().padStart(2, "0"),
//     );
//     const [endHour, setEndHour] = useState(
//         oneHourLater.getHours().toString().padStart(2, "0"),
//     );
//     const [endMinute, setEndMinute] = useState(
//         oneHourLater.getMinutes().toString().padStart(2, "0"),
//     );
//     const [day, setDay] = useState(now.getDate().toString().padStart(2, "0"));
//     const [month, setMonth] = useState(
//         (now.getMonth() + 1).toString().padStart(2, "0"),
//     );

//     useEffect(() => {
//         async function render() {
//             launchSearch(true);

//             const startHourNumber = parseInt(startHour, 10);
//             const startMinuteNumber = parseInt(startMinute, 10);
//             const endHourNumber = parseInt(endHour, 10);
//             const endMinuteNumber = parseInt(endMinute, 10);
//             const dayNumber = parseInt(day, 10);
//             const monthNumber = parseInt(month, 10);

//             // Validate inputs
//             const errors = [];
//             if (
//                 isNaN(startHourNumber) ||
//                 startHourNumber < 0 ||
//                 startHourNumber > 23
//             )
//                 errors.push("Heure de départ invalide.");
//             if (
//                 isNaN(startMinuteNumber) ||
//                 startMinuteNumber < 0 ||
//                 startMinuteNumber > 59
//             )
//                 errors.push("Minute de départ invalide.");
//             if (isNaN(endHourNumber) || endHourNumber < 0 || endHourNumber > 23)
//                 errors.push("Heure de fin invalide.");
//             if (
//                 isNaN(endMinuteNumber) ||
//                 endMinuteNumber < 0 ||
//                 endMinuteNumber > 59
//             )
//                 errors.push("Minute de fin invalide.");
//             if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31)
//                 errors.push("Jour invalide.");
//             if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12)
//                 errors.push("Mois invalide.");

//             // Check that start time is not after end time
//             const year = new Date().getFullYear();
//             const startDateTime = new Date(
//                 year,
//                 monthNumber - 1,
//                 dayNumber,
//                 startHourNumber,
//                 startMinuteNumber,
//             );
//             const endDateTime = new Date(
//                 year,
//                 monthNumber - 1,
//                 dayNumber,
//                 endHourNumber,
//                 endMinuteNumber,
//             );

//             if (startDateTime > endDateTime)
//                 errors.push("L'heure de fin doit être après l'heure de début.");

//             if (errors.length > 0) {
//                 openToast(errors.join(" "));
//                 launchSearch(false);
//                 return;
//             }

//             // Format numbers with leading zeros
//             const pad = (num: number) => num.toString().padStart(2, "0");

//             const dateString = `${year}-${pad(monthNumber)}-${pad(dayNumber)}`;
//             const startTime = `${pad(startHourNumber)}:${pad(startMinuteNumber)}:00+01:00`;
//             const endTime = `${pad(endHourNumber)}:${pad(endMinuteNumber)}:00+01:00`;
//             const debut = `${dateString}T${startTime}`;
//             const fin = `${dateString}T${endTime}`;

//             let featuresUrl = "";
//             if (visioFeature) {
//                 featuresUrl += "visio";
//                 featuresUrl += ilotFeature ? "-ilot" : "";
//             } else {
//                 featuresUrl += ilotFeature ? "ilot" : "";
//             }

//             try {
//                 let urlString = `${
//                     import.meta.env.VITE_BACKEND_URL
//                 }/rooms/available?start=${encodeURIComponent(
//                     debut,
//                 )}&end=${encodeURIComponent(
//                     fin,
//                 )}&seats=${seats.toString()}&whiteboards=${whiteBoards.toString()}&blackboards=${blackBoards.toString()}`;
//                 if (type) urlString += `&type=${type}`;
//                 if (nobadgeFeature) urlString += `&nobadge=true`;
//                 if (featuresUrl) urlString += `&features=${featuresUrl}`;

//                 const response = await fetch(urlString, {
//                     credentials: "include",
//                 });
//                 const availableRooms: ApiDataRoom[] = await response.json();

//                 if (availableRooms) {
//                     // availableRoomsListHook(availableRooms);
//                 }
//             } catch (e) {
//                 console.error(e);
//                 openToast(
//                     "Impossible de rechercher une salle pour l'instant. Réessayez plus tard.",
//                 );
//             } finally {
//                 launchSearch(false);
//                 if (close) close();
//             }
//         }

//         if (searchLaunched) {
//             render();
//         }
//     }, [
//         blackBoards,
//         close,
//         day,
//         endHour,
//         endMinute,
//         ilotFeature,
//         month,
//         nobadgeFeature,
//         openToast,
//         searchLaunched,
//         seats,
//         startHour,
//         startMinute,
//         type,
//         visioFeature,
//         whiteBoards,
//     ]);

//     return (
//         <div className="filter-rooms">
//             <div className="option">
//                 <div className="setDate">
//                     <div className="picker-container">
//                         <p>Chercher de :</p>
//                         <div className="time-picker">
//                             <input
//                                 type="number"
//                                 max="24"
//                                 maxLength={2}
//                                 className="time"
//                                 placeholder="--"
//                                 value={startHour}
//                                 onChange={(event) =>
//                                     setStartHour(event.target.value)
//                                 }
//                             />
//                             <p>:</p>
//                             <input
//                                 type="number"
//                                 max="59"
//                                 maxLength={2}
//                                 className="time"
//                                 placeholder="--"
//                                 value={startMinute}
//                                 onChange={(event) =>
//                                     setStartMinute(event.target.value)
//                                 }
//                             />
//                             <p style={{ margin: "0 4px" }}>à</p>
//                             <input
//                                 type="number"
//                                 max="24"
//                                 maxLength={2}
//                                 className="time"
//                                 placeholder="--"
//                                 value={endHour}
//                                 onChange={(event) =>
//                                     setEndHour(event.target.value)
//                                 }
//                             />
//                             <p>:</p>
//                             <input
//                                 type="number"
//                                 max="59"
//                                 maxLength={2}
//                                 className="time"
//                                 placeholder="--"
//                                 value={endMinute}
//                                 onChange={(event) =>
//                                     setEndMinute(event.target.value)
//                                 }
//                             />
//                         </div>
//                     </div>
//                     <div className="picker-container">
//                         <p>Le :</p>
//                         <div className="time-picker">
//                             <input
//                                 type="number"
//                                 max="31"
//                                 maxLength={2}
//                                 className="time"
//                                 placeholder="--"
//                                 value={day}
//                                 onChange={(event) => setDay(event.target.value)}
//                             />
//                             <p>/</p>
//                             <input
//                                 type="number"
//                                 max="12"
//                                 maxLength={2}
//                                 className="time"
//                                 placeholder="--"
//                                 value={month}
//                                 onChange={(event) =>
//                                     setMonth(event.target.value)
//                                 }
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="option">
//                 <p>
//                     Avec au moins{" "}
//                     <span className="numb" data-ref="placesAssises" id="places">
//                         {seats}
//                     </span>{" "}
//                     places assises
//                 </p>
//                 <div className="slidecontainer">
//                     <input
//                         type="range"
//                         min="2"
//                         max="100"
//                         value={seats}
//                         className="slider"
//                         id="placesAssises"
//                         onChange={(event) =>
//                             setSeats(parseFloat(event.target.value))
//                         }
//                     />
//                 </div>
//             </div>

//             <div className="option">
//                 <p>Avec au moins :</p>
//                 <div className="sliders">
//                     <div className="slide-selector">
//                         <p>
//                             <span className="numb" data-ref="blanc">
//                                 {whiteBoards}
//                             </span>{" "}
//                             {whiteBoards > 1
//                                 ? "tableaux blancs"
//                                 : "tableau blanc"}
//                         </p>
//                         <div className="slidecontainer">
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="4"
//                                 value={whiteBoards}
//                                 className="slider"
//                                 id="blanc"
//                                 onChange={(event) =>
//                                     setWhiteBoards(
//                                         parseFloat(event.target.value),
//                                     )
//                                 }
//                             />
//                         </div>
//                     </div>
//                     <div className="slide-selector">
//                         <p>
//                             <span className="numb" id="places" data-ref="noir">
//                                 {blackBoards}
//                             </span>{" "}
//                             {blackBoards > 1
//                                 ? "tableaux noirs"
//                                 : "tableau noir"}
//                         </p>
//                         <div className="slidecontainer">
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="4"
//                                 value={blackBoards}
//                                 className="slider"
//                                 id="noir"
//                                 onChange={(event) =>
//                                     setBlackBoards(
//                                         parseFloat(event.target.value),
//                                     )
//                                 }
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="option">
//                 <p>Caractéristiques :</p>
//                 <div className="tags" id="caracteristiques">
//                     <div
//                         className={`tag ${visioFeature ? "selected" : ""}`}
//                         onClick={() => {
//                             if (visioFeature) setVisioFeature(false);
//                             else setVisioFeature(true);
//                         }}
//                     >
//                         <p>VISIOCONFÉRENCE</p>
//                     </div>
//                     <div
//                         className={`tag ${ilotFeature ? "selected" : ""}`}
//                         onClick={() => {
//                             if (ilotFeature) setIlotFeature(false);
//                             else setIlotFeature(true);
//                         }}
//                     >
//                         <p>ILOT</p>
//                     </div>
//                     <div
//                         className={`tag ${nobadgeFeature ? "selected" : ""}`}
//                         onClick={() => {
//                             if (nobadgeFeature) setNobadgeFeature(false);
//                             else setNobadgeFeature(true);
//                         }}
//                     >
//                         <p>ACCÈS SANS BADGE</p>
//                     </div>
//                 </div>
//             </div>
//             <div className="option">
//                 <p>Type :</p>
//                 <div className="tags" id="type">
//                     <div
//                         className={`tag ${type == "info" ? "selected" : ""}`}
//                         onClick={() => {
//                             if (type == "info") setType("");
//                             else setType("info");
//                         }}
//                     >
//                         <p>INFORMATIQUE</p>
//                     </div>
//                     <div
//                         className={`tag ${type == "tp" ? "selected" : ""}`}
//                         onClick={() => {
//                             if (type == "tp") setType("");
//                             else setType("tp");
//                         }}
//                     >
//                         <p>TP</p>
//                     </div>
//                     <div
//                         className={`tag ${type == "td" ? "selected" : ""}`}
//                         onClick={() => {
//                             if (type == "td") setType("");
//                             else setType("td");
//                         }}
//                     >
//                         <p>TD</p>
//                     </div>
//                     <div
//                         className={`tag ${type == "amphi" ? "selected" : ""}`}
//                         onClick={() => {
//                             if (type == "amphi") setType("");
//                             else setType("amphi");
//                         }}
//                     >
//                         <p>AMPHITHÉÂTRE</p>
//                     </div>
//                 </div>
//                 <div
//                     style={{ display: "flex", justifyContent: "space-between" }}
//                 >
//                     <span>Inclure les salles à badge</span>
//                     <Switch />
//                 </div>
//                 <DateTimePicker />
//             </div>
//             <TextButton
//                 className="search-button"
//                 onClick={() => launchSearch(true)}
//                 isLoading={searchLaunched}
//                 text="Rechercher"
//             />
//         </div>
//     );
// }

// export { SearchModal };

import { useState, type InputEvent, type ReactElement } from "react";

import "./SearchModal.css";
import { TextButton } from "../../../../../components/button/Button";
import {
    Card,
    CardHeader,
    CardContent,
} from "../../../../../components/card/Card.js";
import { ChipsContainer } from "../../../../../components/chip/Chip.js";
import { Switch } from "../../../../../components/switch/Switch";
import { Slider } from "../../../../../components/slider/Slider.js";
import {
    DatePicker,
    TimePicker,
} from "../../../../../components/date-time-picker/DateTimePicker.js";
import { isExists } from "date-fns";

function SearchModal({ close }: { close?: () => void }): ReactElement {
    const [seats, setSeats] = useState(6);
    const [blackBoards, setBlackBoards] = useState(0);
    const [whiteBoards, setWhiteBoards] = useState(0);
    const [isSwitchChecked, setIsSwitchChecked] = useState<boolean>(false);
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());
    const [selectedStartTime, setSelectedStartTime] = useState<Date>(
        new Date(),
    );
    const [selectedEndTime, setSelectedEndTime] = useState<Date>(
        // Now + 1h
        new Date(new Date().getTime() + 3600 * 1000),
    );

    const handleSeatsChange = (s: number): void => {
        setSeats(s);
    };
    const handleBlackBoardsChange = (s: number): void => {
        setBlackBoards(s);
    };
    const handleWhiteBoardsChange = (s: number): void => {
        setWhiteBoards(s);
    };

    return (
        <div className="search">
            <div className="options">
                <div className="schedules-layout">
                    <DatePicker
                        selectedDate={selectedDay}
                        setSelectedDate={setSelectedDay}
                    />
                    <Card className="selector">
                        <CardContent>
                            <div className="section">
                                <span className="section-title">
                                    À partir de :
                                </span>
                                <TimePicker
                                    selectedTime={selectedStartTime}
                                    setSelectedTime={setSelectedStartTime}
                                />
                            </div>
                            <div className="section">
                                <span className="section-title">Jusqu'à :</span>
                                <TimePicker
                                    selectedTime={selectedEndTime}
                                    setSelectedTime={setSelectedEndTime}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader text="Caractéristiques"></CardHeader>
                    <CardContent>
                        <div className="features">
                            <div className="section">
                                <span className="section-title">
                                    Places assises
                                </span>
                                <div className="slider-container">
                                    <span className="legend">
                                        <span className="value">
                                            {seats === 100 ? "100+" : seats}
                                        </span>
                                    </span>
                                    <Slider
                                        min={2}
                                        max={100}
                                        defaultValue={seats}
                                        onChange={handleSeatsChange}
                                    />
                                </div>
                            </div>
                            <div className="section">
                                <span className="section-title">Tableaux</span>
                                <div className="slider-container">
                                    <span className="legend">
                                        Noirs :{" "}
                                        <span className="value">
                                            {blackBoards === 4
                                                ? "4+"
                                                : blackBoards}
                                        </span>
                                    </span>
                                    <Slider
                                        min={0}
                                        max={4}
                                        defaultValue={blackBoards}
                                        onChange={handleBlackBoardsChange}
                                    />
                                </div>
                                <div className="slider-container">
                                    <span className="legend">
                                        Blancs :{" "}
                                        <span className="value">
                                            {whiteBoards === 4
                                                ? "4+"
                                                : whiteBoards}
                                        </span>
                                    </span>
                                    <Slider
                                        min={0}
                                        max={4}
                                        defaultValue={whiteBoards}
                                        onChange={handleWhiteBoardsChange}
                                    />
                                </div>
                            </div>
                            <div className="section">
                                <span className="section-title">
                                    Autres équipements
                                </span>
                                <ChipsContainer
                                    multiSelect
                                    options={["Îlots", "Visioconférence"]}
                                    name="Test"
                                />
                            </div>
                            <div className="switch-container">
                                <span>Inclure les salles à badge</span>
                                <Switch
                                    isChecked={isSwitchChecked}
                                    setIsChecked={setIsSwitchChecked}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader text="Type"></CardHeader>
                    <CardContent>
                        <ChipsContainer
                            multiSelect
                            options={[
                                "Amphitéâtre",
                                "Informatique",
                                "TD",
                                "TP",
                            ]}
                            name="Test"
                        />
                    </CardContent>
                </Card>
            </div>
            <TextButton text="Rechercher" />
        </div>
    );
}

export { SearchModal };
