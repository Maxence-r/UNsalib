import Image from "next/image";
import styles from "./page.module.css";
import Button from "@/components/button";
import Input from "@/components/input";

export default function Home() {
    return (
        <div>
            <section className="no-compatible">
                <p>Votre écran est orienté dans le mauvais sens ou trop petit.</p>
            </section>
            <section className="loader">
                <div className="progress">
                    <img src="/loader.svg" />
                </div>
            </section>
            <div tabIndex={-1} className="modal">
                <div className="modal-content">
                    <div className="course-details">
                        <div className="course-box">
                            <p className="course-start">18h00</p>
                            <div className="course-container">
                                <p>Course Name</p>
                            </div>
                            <p className="course-end">19h30</p>
                        </div>
                        <div className="detail">
                            <h2>Enseignant(e)(s) :</h2>
                            <p id="teacher-name">Professor Name</p>
                        </div>
                        <div className="detail">
                            <h2>Module :</h2>
                            <p id="module">Professor Name</p>
                        </div>
                        <div className="detail">
                            <h2>Durée :</h2>
                            <p id="duration">Professor Name</p>
                        </div>
                        <div className="detail">
                            <h2>Groupe(s) :</h2>
                            <p id="groupes">Professor Name</p>
                        </div>
                    </div>
                    <div className="filter-rooms">
                        <div className="option">
                            <div className="setDate">
                                <div className="picker-container">
                                    <p>Chercher de :</p>
                                    <div className="time-picker">
                                        <input type="number" max="24" maxLength={2}  className="time" placeholder="--" />
                                        <p>:</p>
                                        <input type="number" max="59" maxLength={2}  className="time" placeholder="--" />
                                        <p>à</p>
                                        <input type="number" max="24" maxLength={2}  className="time" placeholder="--" />
                                        <p>:</p>
                                        <input type="number" max="59" maxLength={2} className="time" placeholder="--" />
                                    </div>
                                </div>
                                <div className="picker-container">
                                    <p>Le :</p>
                                    <div className="time-picker">
                                        <input type="number" max="31" maxLength={2}  className="time" placeholder="--" />
                                        <p>/</p>
                                        <input type="number" max="12" maxLength={2}  className="time" placeholder="--" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="option">
                            <p>Avec au moins <span className="numb" data-ref="placesAssises" id="places">6</span> places assises</p>
                            <div className="slidecontainer">
                                <input type="range" min="2" max="100" value="6" className="slider" id="placesAssises"/>
                            </div>
                        </div>

                        <div className="option">
                            <p>Avec au moins :</p>
                            <div className="sliders">
                                <div className="slide-selector">
                                    <p><span className="numb" data-ref="blanc">0</span> tableau(x) blanc(s)</p>
                                    <div className="slidecontainer">
                                        <input type="range" min="0" max="4" value="0" className="slider" id="blanc"/>
                                    </div>
                                </div>
                                <div className="slide-selector">
                                    <p><span className="numb" id="places" data-ref="noir">0</span> tableau(x) noir(s)</p>
                                    <div className="slidecontainer">
                                        <input type="range" min="0" max="4" value="0" className="slider" id="noir"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="option">
                            <p>Caractéristiques :</p>
                            <div className="tags" id="caracteristiques">
                                <div className="tag">
                                    <p>VISIOCONFÉRENCE</p>
                                </div>
                                <div className="tag">
                                    <p>ILOT</p>
                                </div>
                                <div className="tag">
                                    <p>ACCÈS SANS BADGE</p>
                                </div>
                            </div>
                        </div>
                        <div className="option">
                            <p>Type :</p>
                            <div className="tags" id="type">
                                <div className="tag">
                                    <p>INFORMATIQUE</p>
                                </div>
                                <div className="tag">
                                    <p>TP</p>
                                </div>
                                <div className="tag">
                                    <p>TD</p>
                                </div>
                                <div className="tag">
                                    <p>AMPHITHÉÂTRE</p>
                                </div>
                            </div>
                        </div>
                        <button type="button" className="search-button">
                            <span className="button__text">Rechercher</span>
                        </button>
                    </div>
                    <div className="pictos">
                        <div className="option">
                            <p>Salle info/vidéo</p>
                            <img src="/video.svg" alt="info" />
                        </div>
                        <div className="option">
                            <p>Salle de visioconférence</p>
                            <img src="/visio.svg" alt="info" />
                        </div>
                        <div className="option">
                            <p>Salle en ilot</p>
                            <img src="/ilot.svg" alt="info" />
                        </div>
                        <div className="option">
                            <p>Salle à badge</p>
                            <img src="/badge.svg" alt="info" />
                        </div>

                        <button type="button" className="search-button">
                            <span className="button__text">Compris !</span>
                        </button>
                    </div>

                    <div className="install">
                        <div className="centered">
                            <h2>Impossible d'installer l'application</h2>
                            <p>Veuillez ouvrir UNsalib sur l'un des navigateurs suivants et recommencer l'installation !</p>
                        </div>
                        <div className="browsers">
                            <div className="browser iosMobile">
                                <img src="/safari.svg" alt="safari" />
                                <p>Safari</p>
                            </div>
                            <div className="browser androidMobile computer">
                                <img src="/chrome.svg" alt="safari" />
                                <p>Google Chrome</p>
                            </div>
                            <div className="browser computer">
                                <img src="/edge.svg" alt="safari" />
                                <p>Edge</p>
                            </div>
                        </div>
                    </div>

                    <div className="successInstall">
                        <div className="centered">
                            <h2>L'application est prête.</h2>
                            <p>L'application a été installée sur votre appareil, merci ! Vous pouvez désormais l'ouvrir depuis votre centre d'applications.</p>
                        </div>

                        <button type="button" className="search-button">
                            <span className="button__text">Compris !</span>
                        </button>
                    </div>

                    <div className="safariInstall">
                        <div className="option">
                            <p>1. Cliquez sur le bouton "Partager"</p>
                            <img src="/share.svg" alt="share" />
                        </div>
                        <div className="option">
                            <p>2. Cliquez sur "Ajouter à l'écran d'accueil"</p>
                            <img src="/add.svg" alt="add" />
                        </div>
                        <button type="button" className="search-button">
                            <span className="button__text">Compris !</span>
                        </button>
                    </div>
                </div>
            </div>
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
                    <div data-ref="edt-finder" className="action tab-active">
                        EDT des salles
                    </div>
                    <div data-ref="room-finder" className="action">
                        Trouver une salle
                    </div>
                </div>

                <div className="actions_container">

                    <div className="edt-finder displayed">
                        <Input className="search" type="text" placeholder="Rechercher une salle, un bâtiment..."></Input>

                        <div className="results-head">
                            <p>Résultats de recherche</p>
                            <div className="indicator">
                                <img src="/info.svg"/>
                                    <p>Pictos</p>
                            </div>
                        </div>
                        <div className="results edt">
                            <p className="no-results">Aucune salle n'a été trouvée.</p>
                        </div>
                    </div>



                    <div className="room-finder">
                        <div className="advanced-search">
                            <Button className="filter-button">Chercher une salle libre</Button>
                        </div>
                        <Input className="search" type="text" placeholder="Filtrer par salle, bâtiment..."></Input>
                        <div className="results-head">
                            <p>Résultats de recherche</p>
                            <div className="indicator">
                                <img src="/info.svg"/>
                                    <p>Pictos</p>
                            </div>
                        </div>

                        <div className="results available">
                            <p className="no-results">Aucune salle n'a été trouvée.</p>
                        </div>
                    </div>
                </div>
            </div>
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
                        <h2>À PROPOS<img src="/arrow.svg"/></h2>
                        <div className="about-content">
                            <div className="links">
                                <div className="link whitePaper">
                                    <div className="link-infos">
                                        <h2>WhitePaper</h2>
                                        <p>Document de nos recherches</p>
                                    </div>
                                    <button tabIndex={-1}>
                                        <img src="/download.svg" alt="Download"/>
                                    </button>
                                </div>
                            </div>
                            <div className="links profile">
                                <div className="link">
                                    <div className="link-infos">
                                        <h2>Maxence.R</h2>
                                        <p>Développeur</p>
                                    </div>
                                    <img src="/maxence.png"/>
                                </div>
                                <div className="link ">
                                    <div className="link-infos">
                                        <h2>Mael.B</h2>
                                        <p>Développeur</p>
                                    </div>
                                    <img src="/profile.png"/>
                                </div>
                                <div className="link">
                                    <div className="link-infos">
                                        <h2>Ethann.A</h2>
                                        <p>Testeur</p>
                                    </div>
                                    <img src="/profile.png"/>
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

            <div className="notif">
                <p>Attention vous avez dépassé</p>
            </div>
        </div>
    );
}
