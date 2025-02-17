'use client';
import { useState, useEffect, useContext } from 'react'
import Button from "@/components/button";
import Input from "@/components/input";
import { SelectedRoomContext } from "./contexts";

// function displayTimetable() {
//     let increment = 0;
//     let currentSalle = null;

//     async function afficherSalle(salle, delta) {

//         const canVibrate = window.navigator.vibrate
//         if (canVibrate) window.navigator.vibrate(10)

//         const newIncrement = (delta == 0) ? 0 : increment + delta;

//         toggleLoading()

//         const response = await fetch(
//             `/api/rooms/timetable/?id=${salle.id}&increment=${newIncrement}`
//         );

//         if (!response.ok) {
//             console.log("Error fetching data");
//             toggleLoading("disable");
//             displayNotification("Les données n'ont pas été enregistrées au-delà !");
//             return;
//         }

//         document.getElementById("room-name").innerText = salle?.alias || salle.name;
//         document.querySelector(".avaibility-box>p").innerText = salle?.alias || salle.name;
//         document.querySelector('.avaibility-box .ping').className = salle.available ? "ping blue" : "ping red";
//         document.querySelector('.avaibility-box .ping').style.display = "block";

//         document.querySelectorAll(".course").forEach((el) => el.remove());

//         const salleData = await response.json();

//         // Update increment and currentSalle only if the request succeeds
//         increment = newIncrement;
//         currentSalle = salle;

//         const startDate = salleData.weekInfos.start.split("-")[2];

//         document.querySelectorAll(".day").forEach((el, i = 0) => {
//             el.innerText = " " + (parseInt(startDate) + i);
//             i++;
//         });

//         document.querySelector(".week-number").innerText = salleData.weekInfos.number;

//         if (currentWeekNumber == "--") {
//             currentWeekNumber = salleData.weekInfos.number;
//         }
//         setHourIndicator();

//         const parsedCourses = groupOverlappingCourses(salleData.courses);
//         parsedCourses.forEach((coursesArray) => {
//             coursesArray.forEach((coursData, index) => {
//                 const courseStart = new Date(coursData.start);
//                 const column = courseStart.getDay() - 1;
//                 if (column > 4) return;

//                 const course_content = document.createElement("div");
//                 const course_module = document.createElement("h2");
//                 const course_prof = document.createElement("p");

//                 course_content.onclick = () => {
//                     openModal("course-details");
//                     displayDetails(coursData);
//                 };

//                 if (coursData.modules.length > 0) {
//                     course_module.innerText = joinArrayElements(coursData.modules, ';', ' - ') == '' ? 'Cours inconnu' : joinArrayElements(coursData.modules, ';', ' - ');;
//                 } else if (coursData.category) {
//                     course_module.innerText = coursData.category;
//                 } else {
//                     course_module.innerText = 'Cours inconnu';
//                 }
//                 course_prof.innerText = coursData.teachers.length > 0 ? coursData.teachers.join(' ; ') : '';

//                 course_content.appendChild(course_module);
//                 course_content.appendChild(course_prof);

//                 course_content.style.top = `${coursData.overflow}%`;
//                 course_content.style.backgroundColor = coursData.color;

//                 course_content.style.height = `calc(${coursData.duration}% + ${(coursData.duration > 100 ? Math.floor(coursData.duration / 100) * 2 : 0)}px)`;
//                 course_content.style.width = `${100 / coursesArray.length}%`;
//                 course_content.style.left = `${100 - (100 / coursesArray.length) * (coursesArray.length - index)}%`;
//                 course_content.classList.add("course");

//                 const row = courseStart.getHours() - heureDebut;

//                 columns[column]
//                     .querySelectorAll(".content-box")[row]
//                     .appendChild(course_content);
//             });
//         });
//         toggleLoading("disable");
//     }
// }

export default function Calendar() {
    const [activeTab, setActiveTab] = useState("edt-finder");
    const [events, setEvents] = useState([]);
    const { selectedRoomId, setSelectedRoomId } = useContext(SelectedRoomContext);

    useEffect(() => {
        // if (selectedRoom) {
        //     fetch(`http://localhost:9000/api/rooms/timetable/?id=${selectedRoom}`)
        //         .then((res) => res.json())
        //         .then((data) => setEvents(data));
        // }
        console.log("changed")
    }, [selectedRoomId]);

    return (
        <div className="calendar">
            <div className="loader-indicator">
                <span className="spin"></span>
                <p>Chargement de l'EDT...</p>
            </div>
            <div className="calendar-header">
                <div className="week-switcher">
                    <img src="/chevrons-left.svg" alt="previous" />
                    <p>SEMAINE <span className="week-number">--</span></p>
                    <img src="/chevrons-right.svg" alt="next" />
                </div>
                <div className="avaibility">
                    <div className="avaibility-box">
                        <div className="red ping"></div>
                        <p>SÉLECTIONNEZ UNE SALLE</p>
                    </div>
                </div>
            </div>
            <div className="calendar-container">
                <div className="calendar-hours">
                    <div className="calendar-top"></div>
                    <div className="calendar-hours-display">
                        <div className="indicator-hour">

                        </div>
                    </div>
                </div>
                <div className="calendar-columns">
                    <h2>{selectedRoomId}</h2>
                    <ul>
                        {JSON.stringify(events)}
                    </ul>
                    <div className="column">
                        <div className="calendar-top">
                            <p>Lundi<span className="day"> --</span></p>
                        </div>

                        <div className="column-content">

                        </div>
                    </div>
                    <div className="column">
                        <div className="calendar-top">
                            <p>Mardi<span className="day"> --</span></p>
                        </div>

                        <div className="column-content"></div>
                    </div>
                    <div className="column">
                        <div className="calendar-top">
                            <p>Mercredi<span className="day"> --</span></p>
                        </div>

                        <div className="column-content"></div>
                    </div>
                    <div className="column">
                        <div className="calendar-top">
                            <p>Jeudi<span className="day"> --</span></p>
                        </div>

                        <div className="column-content"></div>
                    </div>
                    <div className="column">
                        <div className="calendar-top">
                            <p>Vendredi<span className="day"> --</span></p>
                        </div>

                        <div className="column-content"></div>
                    </div>
                </div>
                <div tabIndex={-1} className="about">
                    <h2>À PROPOS<img src="/arrow.svg" /></h2>
                    <div className="about-content">
                        <div className="links">
                            <div className="link whitePaper">
                                <div className="link-infos">
                                    <h2>WhitePaper</h2>
                                    <p>Document de nos recherches</p>
                                </div>
                                <button tabIndex={-1}>
                                    <img src="/download.svg" alt="Download" />
                                </button>
                            </div>
                        </div>
                        <div className="links profile">
                            <div className="link">
                                <div className="link-infos">
                                    <h2>Maxence.R</h2>
                                    <p>Développeur</p>
                                </div>
                                <img src="/maxence.png" />
                            </div>
                            <div className="link ">
                                <div className="link-infos">
                                    <h2>Mael.B</h2>
                                    <p>Développeur</p>
                                </div>
                                <img src="/profile.png" />
                            </div>
                            <div className="link">
                                <div className="link-infos">
                                    <h2>Ethann.A</h2>
                                    <p>Testeur</p>
                                </div>
                                <img src="/profile.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="menu-mobile">
                <div className="current-room">
                    <p>Salle actuelle:</p>
                    <h2 id="room-name">---</h2>
                </div>
                <button className="menu-button">
                    MENU
                </button>
            </div>
        </div>
    )
}