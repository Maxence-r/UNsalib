import { useState, type ReactElement } from "react";
import { ArrowLeftRight } from "lucide-react";

import {
    type Campuses,
} from "../../../../../stores/settings.store.js";
import { CAMPUSES } from "../../../../../utils/constants.js";
import { Select } from "../../../../../components/select/Select.js";
import type { ApiDataBuilding } from "../../../../../utils/types/api.type.js";
import { TextButton } from "../../../../../components/button/Button.js";
import { MoveBuilding } from "../../../../../api/buildings.api.js";
import { useToast } from "../../../../../components/toast/ToastHook.js";

function MoveBuildingModal({
    building,
    refreshBuildingsList,
    close,
}: {
    building: ApiDataBuilding | null;
    refreshBuildingsList: () => void;
    close?: () => void;
}): ReactElement {
    const [selectedCampus, setSelectedCampus] = useState<Campuses>(
        CAMPUSES[0].id,
    );
    const [isMoving, setIsMoving] = useState<boolean>(false);
    const { open: openToast } = useToast();

    if (!building) return <></>;

    const handleMove = async (): Promise<void> => {
        setIsMoving(true);
        const campusName = CAMPUSES.find((c) => c.id === selectedCampus)?.name;

        try {
            await new MoveBuilding(building.id, selectedCampus).do();
            close?.();
            openToast(
                `${building.alias ? building.alias : building.id} a été déplacé vers ${campusName} avec succès !`,
                false,
            );
            refreshBuildingsList();
        } catch (e) {
            console.error(e);
            openToast(
                `Impossible de déplacer ${building.alias ? building.alias : building.id} vers ${campusName}.`,
            );
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <div className="move-building">
            <h3 className="title">
                Déplacer {building.alias ? building.alias : building.id}
            </h3>
            <div className="form">
                <p>
                    Sélectionnez le nouveau campus auquel{" "}
                    {building.alias ? building.alias : building.id} et toutes
                    ses salles appartiendront.
                </p>
                <Select
                    options={CAMPUSES}
                    selected={selectedCampus}
                    setSelected={setSelectedCampus}
                />
            </div>
            <div className="actions">
                <TextButton text="Annuler" secondary onClick={close} />
                <TextButton
                    text="Déplacer"
                    icon={<ArrowLeftRight />}
                    isLoading={isMoving}
                    onClick={handleMove}
                />
            </div>
        </div>
    );
}

export { MoveBuildingModal };
