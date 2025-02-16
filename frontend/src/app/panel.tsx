// import Button from "@/components/button";
// import Input from "@/components/input";
// import { fetchRooms } from './requestsManager';
import RoomsList from "./roomsList";
import { RoomsListType } from "./types";

export default async function Panel() {
    const response = await fetch(`${process.env.API_URI}/rooms`);
    const rooms: RoomsListType[] = await response.json();
    // try {
        
    // } catch (error) {
    //     console.error("Erreur lors de la récupération des salles :", error);
    // }

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

            <RoomsList roomsList={rooms}></RoomsList>
        </div>
    )
}