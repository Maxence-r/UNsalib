"use client";
import RoomsList from "./roomsList";
import { RoomsListType } from "./types";
import { useContext } from "react";
import { PanelContext } from "./contexts";

export default function Panel({ roomsList }: { roomsList: RoomsListType[] }) {
    const { isPanelActive, setPanelState } = useContext(PanelContext);

    return (
        <div tabIndex={-1} className={`pannel ${isPanelActive ? "" : "hidden"}`}>
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

            <RoomsList roomsList={roomsList}></RoomsList>
        </div>
    )
}