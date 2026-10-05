import type { ReactElement } from "react";

import "./CampusModal.css";
import { Card, CardContent } from "../../../../../components/card/Card.js";
import { Badge } from "../../../../../components/badge/Badge.js";
import { useSettingsStore } from "../../../../../stores/settings.store.js";
import { CAMPUSES } from "../../../../../utils/constants.js";

function CampusModal({ close }: { close?: () => void }): ReactElement {
    const setDefaultCampus = useSettingsStore((s) => s.setDefaultCampus);

    return (
        <div className="campuses">
            <div className="header">
                <h3 className="title">Campus disponibles</h3>
                <h4 className="subtitle">Déplacez-vous en 1 clic !</h4>
            </div>
            {CAMPUSES.map((campus) => (
                <Card
                    className="campus"
                    onClick={() => {
                        setDefaultCampus(campus.id);
                        close?.();
                    }}
                    key={campus.name}
                >
                    <div
                        className="banner"
                        style={{ backgroundImage: `url(${campus.bannerUrl})` }}
                    ></div>
                    <CardContent>
                        <span>{campus.name}</span>
                        {campus.beta && <Badge text="Beta" accent />}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export { CampusModal };
