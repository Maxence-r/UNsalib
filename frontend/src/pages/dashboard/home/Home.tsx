import type { ReactElement } from "react";
import { useNavigate } from "react-router";

import "./Home.css";
import { Card, CardHeader } from "../../../components/card/Card";
import { Section } from "../../../components/layout/Layout";
import { useApi } from "../../../utils/hooks/api.hook";
import { getRoomsToReview } from "../../../api/admin.api";
import { TextButton } from "../../../components/button/Button";
import { CircleAlert } from "lucide-react";

function Home(): ReactElement {
    const navigate = useNavigate();
    const { data: roomsToComplete } = useApi(getRoomsToReview, []);

    return (
        <div className="content" id="home">
            <Section className="overview">
                {roomsToComplete && roomsToComplete.length > 0 && (
                    <Card secondary>
                        <CardHeader
                            text="Nouvelles salles ajoutées"
                            icon={<CircleAlert />}
                        />
                        {roomsToComplete.length} nouvelles salles doivent être
                        complétées.
                        <TextButton
                            text="Corriger"
                            onClick={() => navigate("/dashboard/manage")}
                        />
                    </Card>
                )}
            </Section>
        </div>
    );
}

export { Home };
