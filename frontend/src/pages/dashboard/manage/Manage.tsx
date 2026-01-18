import "./Manage.css";
import { Card, CardHeader } from "../../../components/card/Card";
import { Section } from "../../../components/layout/Layout";

function Manage(): React.JSX.Element {
    return (
        <>
            <Section title="Nouveaux bâtiments">
                <Card secondary>
                    <CardHeader text="Header" />
                    Test
                </Card>
            </Section>
            <Section title="Salles à compléter">
                <Card secondary>
                    <CardHeader text="Header" />
                    Test
                </Card>
            </Section>
        </>
    );
}

export { Manage };
