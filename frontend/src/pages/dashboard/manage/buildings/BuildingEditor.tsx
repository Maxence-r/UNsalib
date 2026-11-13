import { useState, type ReactElement } from "react";

import "./BuildingEditor.css";
import { Input } from "../../../../components/input/Input";
import type { ApiDataBuilding } from "../../../../utils/types/api.type";
import { Card, CardHeader } from "../../../../components/card/Card";
import { Section } from "../../../../components/layout/Layout";
import { TextButton } from "../../../../components/button/Button";
import { ArrowLeftRight, Merge, Save } from "lucide-react";
import { UpdateBuilding } from "../../../../api/buildings.api";
import { useToast } from "../../../../components/toast/ToastHook";

function BuildingEditor({
    selectedBuilding,
    refreshBuildingsList,
}: {
    selectedBuilding: ApiDataBuilding | null;
    refreshBuildingsList: () => void;
}): ReactElement {
    const [alias, setAlias] = useState<string>(selectedBuilding?.alias ?? "");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { open: openToast } = useToast();

    const handleSave = async (): Promise<void> => {
        if (!selectedBuilding) return;
        setIsSaving(true);

        try {
            await new UpdateBuilding(
                selectedBuilding.id,
                alias ? alias : null,
            ).do();
            openToast("Bâtiment mis à jour !", false);
            refreshBuildingsList();
        } catch (e) {
            console.error(e);
            openToast("Impossible de sauvegarder les modifications.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card secondary className="building-editor">
            {selectedBuilding ? (
                <>
                    <CardHeader text={selectedBuilding.id} />
                    <Section title="Identifiant">
                        <span>{selectedBuilding.id}</span>
                    </Section>
                    <Section title="Alias">
                        <Input
                            value={alias}
                            onInput={(e) =>
                                setAlias((e.target as HTMLInputElement).value)
                            }
                            placeholder="Entrez un alias..."
                        />
                    </Section>
                    <div className="actions">
                        <TextButton
                            secondary
                            text="Déplacer"
                            icon={<ArrowLeftRight />}
                        />
                        <TextButton
                            secondary
                            text="Fusionner"
                            icon={<Merge />}
                        />
                        <TextButton
                            text="Enregistrer"
                            icon={<Save />}
                            onClick={handleSave}
                            isLoading={isSaving}
                        />
                    </div>
                </>
            ) : (
                <>Aucun bâtiment sélectionné.</>
            )}
        </Card>
    );
}

export { BuildingEditor };
