import { Users, BookOpen, Smile, Link2, ArrowUpRight } from "lucide-react";

import { VERSION_NAME, VERSION_NUMBER } from "../../../../utils/constants.js";
import "./AboutModal.css";

import {
    Card,
    CardHeader,
    CardContent,
} from "../../../../components/card/Card.js";

function AboutModal() {
    return (
        <div className="about">
            <div className="project">
                <Card className="description">
                    <CardHeader text="Vous cherchez une salle ?" />
                    <CardContent>
                        UNsalib permet aux étudiants et professeurs de profiter
                        pleinement des infrastructures de Nantes Université.
                        Travail en groupe, révisions, besoin de grands tableaux
                        ou encore d’ordinateurs : trouvez les salles libres du
                        campus en quelques instants et concentrez-vous sur
                        l’essentiel !
                    </CardContent>
                </Card>
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
                <Card className="version">
                    <CardHeader text='v3.0 "Louisa"' />
                    <CardContent>Historique des versions</CardContent>
                </Card>
                <Card className="code">
                    <CardHeader text="Code source" />
                    <CardContent>Github</CardContent>
                </Card>
            </div>
            <div className="creators">
                <h4 className="title">Qui sommes-nous ?</h4>
                <Card className="ethann">
                    <CardHeader text="Ethann" />
                    <CardContent>Github</CardContent>
                </Card>
                <Card className="mael">
                    <CardHeader text="Maël" />
                    <CardContent>Github</CardContent>
                </Card>
                <Card className="maxence">
                    <CardHeader text="Maxence" />
                    <CardContent>Github</CardContent>
                </Card>
                <Card className="contact">
                    <CardHeader text="Contact" />
                    <CardContent>contact@unsalib.info</CardContent>
                </Card>
                <Card className="feedback">
                    <CardHeader text="Avis" />
                    <CardContent>
                        Faites-nous part de vos suggestions, remarques...
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export { AboutModal };
