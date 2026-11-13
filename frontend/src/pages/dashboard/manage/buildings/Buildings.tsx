import { useEffect, useState, type ReactElement } from "react";

import "./Buildings.css";
import { Input } from "../../../../components/input/Input";
import { ChipsContainer } from "../../../../components/chip/Chip";
import { CAMPUSES } from "../../../../utils/constants";
import { useApi } from "../../../../utils/hooks/api.hook";
import { GetBuildingsList } from "../../../../api/buildings.api";
import type { Campuses } from "../../../../stores/settings.store";
import type { ApiDataBuilding } from "../../../../utils/types/api.type";
import { Card } from "../../../../components/card/Card";
import { useDeviceType } from "../../../../utils/hooks/device.hook";
import { useModal } from "../../../../components/modal/ModalHook";
import { BuildingEditor } from "./BuildingEditor";

function Panel({
    setSelectedBuilding,
    refreshTrigger,
}: {
    setSelectedBuilding: (building: ApiDataBuilding) => void;
    refreshTrigger: number;
}): ReactElement {
    const [selectedCampus, setSelectedCampus] = useState<Campuses>(
        CAMPUSES[0].id,
    );
    const { data, error } = useApi(new GetBuildingsList(selectedCampus), [
        selectedCampus,
        refreshTrigger,
    ]);

    return (
        <Card secondary className="panel">
            <Input placeholder="Filtrer par nom" />
            <ChipsContainer
                name="Campuses selector"
                options={CAMPUSES}
                selected={selectedCampus}
                setSelected={setSelectedCampus}
            />
            Résultats
            <div className="results">
                {data && data.length > 0 ? (
                    data.map((building) => (
                        <div
                            className="building"
                            key={building.id}
                            onClick={() => setSelectedBuilding(building)}
                        >
                            {building.id}
                        </div>
                    ))
                ) : error ? (
                    <>Erreur de chargement</>
                ) : (
                    <>Aucun bâtiment sur ce campus</>
                )}
            </div>
        </Card>
    );
}

function Buildings(): ReactElement {
    const [selectedBuilding, setSelectedBuilding] =
        useState<ApiDataBuilding | null>(null);
    const [openRequest, setOpenRequest] = useState<number>(0);
    const isMobile = useDeviceType() === "mobile";
    const [buildingsListRefreshTrigger, setBuildingsListRefreshTrigger] =
        useState<number>(0);
    const refreshBuildingsList = (): void =>
        setBuildingsListRefreshTrigger((s) => s + 1);

    const { open: openMobileEditorModal } = useModal(
        "buildings-editor",
        <BuildingEditor
            key={selectedBuilding?.id ?? "empty"}
            selectedBuilding={selectedBuilding}
            refreshBuildingsList={refreshBuildingsList}
        />,
    );

    useEffect(() => {
        if (isMobile && selectedBuilding && openRequest > 0) {
            openMobileEditorModal();
        }
    }, [isMobile, openMobileEditorModal, openRequest, selectedBuilding]);

    const setSelectedAndOpen = (building: ApiDataBuilding): void => {
        setSelectedBuilding(building);
        setOpenRequest((request) => request + 1);
    };

    return (
        <div className="content" id="manage-buildings">
            <Panel
                setSelectedBuilding={setSelectedAndOpen}
                refreshTrigger={buildingsListRefreshTrigger}
            />
            {!isMobile && (
                <BuildingEditor
                    key={selectedBuilding?.id ?? "empty"}
                    selectedBuilding={selectedBuilding}
                    refreshBuildingsList={refreshBuildingsList}
                />
            )}
        </div>
    );
}

export { Buildings };
