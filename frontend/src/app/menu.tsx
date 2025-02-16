'use client';
import { useState } from 'react'
import Button from "@/components/button";
import Input from "@/components/input";

export default function Menu() {
    const [activeTab, setActiveTab] = useState("edt-finder");
    
    return (
        <div tabIndex={-1} className="pannel">

            <div className="loader-indicator">
                <span className="spin"></span>
                <p>Chargement des salles...</p>
            </div>


            <div className="campus">
                <div className="campus_selector">
                    <p>SCIENCES ET TECHNIQUES</p>
                    <div className="version">V1.0</div>
                </div>
                <div className="campus_feed">
                    <img src="/lsh.png" alt="placeholder" />

                    <div className="overlay"></div>
                    <div className="campus_feed_content">
                        <p>ICI S'AFFICHERA LA MISE A JOUR DES GROUPES</p>
                    </div>
                </div>
            </div>

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
        </div>
    )
}