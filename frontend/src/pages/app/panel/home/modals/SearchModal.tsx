import { useState, type ReactElement } from "react";

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
import { GetAvailableRooms } from "../../../../../api/rooms.api.js";
import { useRoomsStore } from "../../../../../stores/rooms.store.js";

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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const setDisplayedRooms = useRoomsStore((s) => s.setDisplayedRooms);

    const handleSeatsChange = (s: number): void => {
        setSeats(s);
    };
    const handleBlackBoardsChange = (s: number): void => {
        setBlackBoards(s);
    };
    const handleWhiteBoardsChange = (s: number): void => {
        setWhiteBoards(s);
    };
    const handleSearchButtonClick = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const roomsIds = await new GetAvailableRooms(
                "tertre",
                selectedStartTime,
                selectedEndTime,
            ).do();
            setDisplayedRooms(roomsIds);
            close?.();
        } finally {
            setIsLoading(false);
        }
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
                                    options={[
                                        { id: "ilots", name: "Îlots" },
                                        {
                                            id: "visio",
                                            name: "Visioconférence",
                                        },
                                    ]}
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
                                { id: "amphi", name: "Amphitéâtre" },
                                { id: "info", name: "Informatique" },
                                { id: "td", name: "TD" },
                                { id: "tp", name: "TP" },
                            ]}
                            name="Test"
                        />
                    </CardContent>
                </Card>
            </div>
            <TextButton
                text="Rechercher"
                isLoading={isLoading}
                onClick={handleSearchButtonClick}
            />
        </div>
    );
}

export { SearchModal };
