'use client';
import { useState } from 'react'
import Button from "@/components/button";
import Input from "@/components/input";
import { RoomsListType } from "./types";

export default function RoomsList({ roomsList }: { roomsList: RoomsListType[] }) {
    const [activeTab, setActiveTab] = useState("edt-finder");

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
                    <Input className="search" type="text" placeholder="Rechercher une salle, un bâtiment..."></Input>

                    <div className="results-head">
                        <p>Résultats de recherche</p>
                        <div className="indicator">
                            <img src="/info.svg" />
                            <p>Pictos</p>
                        </div>
                    </div>
                    <div className="results edt">
                        {roomsList.map(room => (
                            <div key={room.id} className="result" onClick={() => { }}>
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
                        <p className="no-results">Aucune salle n'a été trouvée.</p>
                    </div>
                </div>

                <div className={`room-finder ${activeTab == "room-finder" ? "displayed" : ""}`}>
                    <div className="advanced-search">
                        <Button className="filter-button">Chercher une salle libre</Button>
                    </div>
                    <Input className="search" type="text" placeholder="Filtrer par salle, bâtiment..."></Input>
                    <div className="results-head">
                        <p>Résultats de recherche</p>
                        <div className="indicator">
                            <img src="/info.svg" />
                            <p>Pictos</p>
                        </div>
                    </div>

                    <div className="results available">
                        <p className="no-results">Aucune salle n'a été trouvée.</p>
                    </div>
                </div>
            </div>
        </>
    )
}