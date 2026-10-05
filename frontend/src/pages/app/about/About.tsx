import type { ReactElement } from "react";
import { Code, History, Mail } from "lucide-react";

import "./About.css";
import {
    Card,
    CardHeader,
    CardContent,
} from "../../../components/card/Card.js";
import { TextButton } from "../../../components/button/Button.js";
import Mael from "../../../assets/imgs/mael.png";
import Ethann from "../../../assets/imgs/ethann.png";
import Maxence from "../../../assets/imgs/maxence.png";
import { VERSION_NAME, VERSION_NUMBER } from "../../../utils/constants.js";

function About(): ReactElement {
    return (
        <div className="about">
            <div className="section project">
                <Card className="description">
                    <CardContent>
                        <div className="version">
                            <img src="/logo96.png" alt="UNsalib logo" />
                            <div>
                                <h1>UNsalib</h1>
                                <span>{`v${VERSION_NUMBER} "${VERSION_NAME}"`}</span>
                            </div>
                        </div>
                        <h3>Vous cherchez une salle ?</h3>
                        <div className="paragraph">
                            UNsalib permet aux étudiants et professeurs de
                            profiter pleinement des infrastructures de Nantes
                            Université.
                        </div>
                        <div className="paragraph">
                            Travail en groupe, révisions, besoin de grands
                            tableaux ou encore d’ordinateurs : trouvez les
                            salles libres du campus en quelques instants et
                            concentrez-vous sur l’essentiel !
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className="changelog"
                    onClick={() => console.log("changelog")}
                >
                    <CardHeader
                        text="Journal des modifications"
                        icon={<History />}
                    />
                </Card>
            </div>
            <div className="section creators">
                <Card className="credits">
                    <CardHeader text="Remerciements" />
                    <CardContent>
                        Merci à tous ceux qui nous ont encouragés et soutenus,
                        en particulier notre professeur, M. Christophe Lino.
                        Merci également à Nantes Université de nous donner accès
                        librement aux emplois du temps des différentes
                        formations.
                    </CardContent>
                </Card>
                <h4 className="title">Qui sommes-nous ?</h4>
                <div className="content">
                    <Card className="ethann">
                        <CardHeader text="Ethann" />
                        <img src={Ethann} />
                    </Card>
                    <Card className="maxence">
                        <CardHeader text="Maxence" />
                        <img src={Maxence} />
                    </Card>
                    <Card className="mael">
                        <CardHeader text="Maël" />
                        <img src={Mael} />
                    </Card>
                    <Card
                        className="contact"
                        onClick={() =>
                            window
                                .open("mailto:contact@unsalib.info", "_blank")
                                ?.focus()
                        }
                    >
                        <CardHeader text="Contact" icon={<Mail />} />
                        <CardContent>
                            Envoyez-nous un mail à contact@unsalib.info.
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Card className="footer">
                <CardContent>
                    UNsalib n'est pas affilié, associé, ou en aucun cas
                    officiellement lié à Nantes Université.
                    <br />
                    L'application est un projet open-source disponible sous
                    licence GNU General Public License v3.0.
                    <TextButton
                        text="Github"
                        secondary
                        icon={<Code />}
                        onClick={() =>
                            window
                                .open(
                                    "https://github.com/Maxence-r/UNsalib",
                                    "_blank",
                                )
                                ?.focus()
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export { About };
