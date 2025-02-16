'use client';
import { useState } from 'react'
import Button from "@/components/button";
import Input from "@/components/input";

export default function Calendar() {
    const [activeTab, setActiveTab] = useState("edt-finder");

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