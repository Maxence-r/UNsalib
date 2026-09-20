import type { ReactElement } from "react";

import "./Manage.css";
import { Card, CardHeader } from "../../../components/card/Card";
import { Section } from "../../../components/layout/Layout";
import { useApi } from "../../../utils/hooks/api.hook";
import { getRoomsToReview } from "../../../api/admin.api";

function Manage(): ReactElement {
    const {
        data: roomsToComplete,
        isLoading,
        error,
    } = useApi(getRoomsToReview, []);

    return (
        <div className="content" id="manage">
            <Section title="Nouvelles salles" className="new-rooms">
                <div className="rooms-list">
                    {roomsToComplete?.map((room) => (
                        <Card secondary>
                            <CardHeader text={room.name} />
                            {room.buildingId ?? ""}
                        </Card>
                    ))}
                </div>
            </Section>
        </div>
    );
}

export { Manage };
