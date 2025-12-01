import { ChevronsLeft, ChevronsRight, Calendar1 } from "lucide-react";

import "./ActionBar.css";
import { TextButton, IconButton } from "../../../../components/button/Button";

const months: { [key: string]: string } = {
    0: "Janvier",
    1: "Février",
    2: "Mars",
    3: "Avril",
    4: "Mai",
    5: "Juin",
    6: "Juillet",
    7: "Août",
    8: "Septembre",
    9: "Octobre",
    10: "Novembre",
    11: "Décembre",
};

function ActionBar({
    currentRoom,
    increment,
    setIncrement,
    weekNumber,
    weekStartDate,
}: {
    currentRoom: string | null;
    increment: number;
    setIncrement: React.Dispatch<React.SetStateAction<number>>;
    weekNumber: number | null;
    weekStartDate: Date | null;
}) {
    const handleNextWeekButtonClick = () => {
        if (weekNumber) setIncrement(increment + 1);
    };

    const handlePreviousWeekButtonClick = () => {
        if (weekNumber) setIncrement(increment - 1);
    };

    const handleTodayButtonClick = () => {
        setIncrement(0);
    };

    return (
        <div className="action-bar">
            <div className="week-switcher">
                <TextButton
                    className="today"
                    text="Ajourd'hui"
                    secondary
                    onClick={handleTodayButtonClick}
                    disabled={!weekStartDate || !weekNumber}
                    icon={<Calendar1 />}
                />
                <IconButton
                    className="today mobile"
                    secondary
                    onClick={handleTodayButtonClick}
                    disabled={!weekStartDate || !weekNumber}
                    icon={<Calendar1 />}
                />
                <IconButton
                    icon={<ChevronsLeft />}
                    secondary
                    onClick={handlePreviousWeekButtonClick}
                    disabled={!weekStartDate || !weekNumber}
                />
                <div className="infos">
                    {weekStartDate && weekNumber ? (
                        <>
                            <span>
                                {weekStartDate
                                    ? months[
                                          weekStartDate.getMonth().toString()
                                      ]
                                    : "--"}
                            </span>
                            <span>•</span>
                            <span className="week">{`Semaine ${weekNumber ?? "--"}`}</span>
                            <span className="week mobile">{`Sem. ${weekNumber ?? "--"}`}</span>
                        </>
                    ) : (
                        <span>--</span>
                    )}
                </div>
                <IconButton
                    icon={<ChevronsRight />}
                    secondary
                    onClick={handleNextWeekButtonClick}
                    disabled={!weekStartDate || !weekNumber}
                />
            </div>
            <div className="current-room">
                {currentRoom ?? "Aucune salle sélectionnée"}
            </div>
        </div>
    );
}

export { ActionBar };
