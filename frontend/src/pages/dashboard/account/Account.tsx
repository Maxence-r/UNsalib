import type { ReactElement } from "react";

import "./Account.css";
import { Card, CardHeader } from "../../../components/card/Card";
import { Section } from "../../../components/layout/Layout";
import {
    useAccountStore,
    type Account as AccountType,
} from "../../../stores/account.store";
import { TextButton } from "../../../components/button/Button";

function Account(): ReactElement {
    const account = useAccountStore<AccountType | null>((s) => s.account);

    if (!account) return <></>;

    return (
        <div className="content" id="account">
            <Section className="general-infos">
                <div className="pp">
                    <span>
                        {`${account.name[0]}${account.lastname[0]}`.toUpperCase()}
                    </span>
                </div>
                <Card secondary>
                    <CardHeader
                        text={`${account.name} ${account.lastname.toUpperCase()}`}
                    />
                    @{account.username} • Administrateur
                </Card>
            </Section>
            <Section title="Sécurité">
                <Card secondary>
                    <CardHeader text="Mot de passe" />
                    Choisissez un mot de passe robuste pour sécuriser votre
                    compte.
                    <TextButton text="Modifier" secondary disabled />
                </Card>
            </Section>
        </div>
    );
}

export { Account };
