import { useState, type ReactElement } from "react";

import { Select } from "../../../../../components/select/Select.js";
import type { ApiDataBuilding } from "../../../../../utils/types/api.type.js";
import { TextButton } from "../../../../../components/button/Button.js";
import {
    GetBuildingsList,
    MergeBuilding,
} from "../../../../../api/buildings.api.js";
import { useToast } from "../../../../../components/toast/ToastHook.js";
import { Merge } from "lucide-react";
import { useApi } from "../../../../../utils/hooks/api.hook.js";

function MergeBuildingModal({
    building,
    refreshBuildingsList,
    close,
}: {
    building: ApiDataBuilding | null;
    refreshBuildingsList: () => void;
    close?: () => void;
}): ReactElement {
    const [isMerging, setIsMerging] = useState<boolean>(false);
    const [selectedBuilding, setSelectedBuilding] = useState<
        ApiDataBuilding[][number]["id"] | null
    >(null);
    const { open: openToast } = useToast();

    const { data } = useApi(new GetBuildingsList(), []);

    if (!building) return <></>;

    const buildingsList =
        data
            ?.filter((b) => b.id !== building.id)
            .map((b) => ({
                id: b.id,
                name: b.alias ? b.alias : b.id,
            })) ?? [];

    const selectedBuildingId =
        selectedBuilding &&
        buildingsList.some((candidate) => candidate.id === selectedBuilding)
            ? selectedBuilding
            : (buildingsList[0]?.id ?? "");
    const targetBuilding = data?.find(
        (candidate) => candidate.id === selectedBuildingId,
    );
    const targetBuildingName = targetBuilding?.alias ?? targetBuilding?.id;

    const handleMerge = async (): Promise<void> => {
        if (!selectedBuildingId) return;

        setIsMerging(true);

        try {
            await new MergeBuilding(building.id, selectedBuildingId).do();
            close?.();
            openToast(
                `${building.alias ? building.alias : building.id} a été fusionné avec ${targetBuildingName} avec succès !`,
                false,
            );
            refreshBuildingsList();
        } catch (e) {
            console.error(e);
            openToast(
                `Impossible de fusionner ${building.alias ? building.alias : building.id} avec ${targetBuildingName}.`,
            );
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div className="move-building">
            <h3 className="title">
                Fusionner {building.alias ? building.alias : building.id}
            </h3>
            <div className="form">
                <p>
                    Sélectionnez le bâtiment avec lequel{" "}
                    {building.alias ? building.alias : building.id} sera
                    fusionné. Toutes ses salles seront déplacées vers le
                    bâtiment cible.
                </p>
                <Select
                    options={buildingsList}
                    selected={selectedBuildingId}
                    setSelected={setSelectedBuilding}
                />
                <p>Récapitulatif des changements :</p>
                <ul>
                    <li>
                        Déplacement des salles de{" "}
                        <strong>
                            {building.alias ? building.alias : building.id}
                        </strong>{" "}
                        vers <strong>{targetBuildingName}</strong>
                    </li>
                    <li>
                        Suppression de{" "}
                        <strong>
                            {building.alias ? building.alias : building.id}
                        </strong>
                    </li>
                </ul>
                <p>
                    <strong>
                        Attention : cette opération est irréversible !
                    </strong>
                </p>
            </div>
            <div className="actions">
                <TextButton text="Annuler" secondary onClick={close} />
                <TextButton
                    text="Fusionner"
                    icon={<Merge />}
                    isLoading={isMerging}
                    onClick={handleMerge}
                />
            </div>
        </div>
    );
}

export { MergeBuildingModal };
