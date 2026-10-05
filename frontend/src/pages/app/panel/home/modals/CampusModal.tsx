import type { ReactElement } from "react";

import "./CampusModal.css";
import { Card, CardContent } from "../../../../../components/card/Card.js";
import { Badge } from "../../../../../components/badge/Badge.js";
import lombarderieBannerUrl from "../../../../../assets/imgs/campuses/lombarderie.jpg";
import tertreBannerUrl from "../../../../../assets/imgs/campuses/tertre.jpg";

const CAMPUSES: { name: string; bannerUrl: string; beta?: boolean }[] = [
    { name: "Lombarderie", bannerUrl: lombarderieBannerUrl },
    { name: "Tertre", bannerUrl: tertreBannerUrl, beta: true },
];

function CampusModal(): ReactElement {
    return (
        <div className="campuses">
            <div className="header">
                <h3 className="title">Campus disponibles</h3>
                <h4 className="subtitle">Déplacez-vous en 1 clic !</h4>
            </div>
            {CAMPUSES.map((campus) => (
                <Card
                    className="campus"
                    onClick={() => console.log(campus.name, "selected")}
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
