import {
    Info,
    Users,
    BookOpen,
    Smile,
    Link2,
    ArrowUpRight,
} from "lucide-react";

import "./Header.css";
import { IconButton } from "../../../../components/button/Button.js";
import PWAInstallButton from "../installButton.js";
import { VERSION_NAME, VERSION_NUMBER } from "../../../../utils/constants.js";
import {
    openModal,
    setModalContent,
} from "../../../../components/modal/Modal.js";
import CampusBannerUrl from "../../../../assets/imgs/campus/sciences-et-techniques.jpg";

function AboutModalContent() {
    return (
        <div className="about">
            <div className="modal-section">
                <h4 className="title">
                    <BookOpen size={20} />À PROPOS
                    <span
                        id="version"
                        onClick={() => window.open("/new", "_blank")}
                    >
                        v{VERSION_NUMBER} &quot;{VERSION_NAME}&quot;
                    </span>
                </h4>
                <div className="content">
                    <p>
                        <strong>UNsalib</strong> est un site web open source qui
                        permet aux étudiants et professeurs de Nantes Université
                        de <strong>trouver les salles libres</strong> du campus
                        et d&apos;afficher leurs{" "}
                        <strong>emplois du temps</strong>.
                    </p>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title">
                    <Users size={20} />
                    L&apos;ÉQUIPE
                </h4>
                <div className="content">
                    <p>
                        Nous sommes trois étudiants motivés pour améliorer le
                        quotidien de tous au sein de l&apos;Université.
                    </p>
                    <div className="grid" id="team">
                        <div
                            className="item"
                            onDoubleClick={() =>
                                (window.location.href = "/admin")
                            }
                        >
                            <div className="infos">
                                <h2>Maxence</h2>
                                <p>Développeur & UX/UI designer</p>
                            </div>
                            <img
                                src="/maxence.png"
                                width={36}
                                height={36}
                                alt=""
                            ></img>
                        </div>
                        <div
                            className="item"
                            onDoubleClick={() =>
                                (window.location.href = "/admin")
                            }
                        >
                            <div className="infos">
                                <h2>Maël</h2>
                                <p>Développeur</p>
                            </div>
                            <img
                                src="/mael.png"
                                width={64}
                                height={64}
                                alt=""
                            ></img>
                        </div>
                        <div
                            className="item"
                            onDoubleClick={() =>
                                (window.location.href = "/admin")
                            }
                        >
                            <div className="infos">
                                <h2>Ethann</h2>
                                <p>Admin DB & testeur</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title">
                    <Smile size={20} />
                    REMERCIEMENTS
                </h4>
                <div className="content">
                    <p>
                        Merci à <strong>Christophe Lino</strong> pour sa
                        confiance et son implication dans le projet, et par
                        ailleurs pour avoir été le premier professeur à utiliser
                        UNsalib.
                    </p>
                    <p>
                        Merci aussi à{" "}
                        <strong>tous ceux qui nous ont encouragés</strong> et
                        qui nous soutiennent dans cette aventure.
                    </p>
                    <p>
                        Merci enfin à <strong>Nantes Université</strong>{" "}
                        d&apos;avoir publié les emplois du temps des différentes
                        formations en libre accès.
                    </p>
                </div>
            </div>
            <div className="modal-section">
                <h4 className="title">
                    <Link2 size={20} />
                    LIENS
                </h4>
                <div className="content">
                    <div className="grid">
                        <div className="item">
                            <div className="infos">
                                <h2>White Paper</h2>
                                <p>Infos de conception</p>
                            </div>
                            <button
                                onClick={() =>
                                    window.open("/white-paper.pdf", "_blank")
                                }
                            >
                                <ArrowUpRight size={20} />
                            </button>
                        </div>
                        <div className="item">
                            <div className="infos">
                                <h2>Github</h2>
                                <p>Code source</p>
                            </div>
                            <button
                                onClick={() =>
                                    window.open(
                                        "https://github.com/Maxence-r/UNsalib_Modern-Timetable-Viewer",
                                        "_blank",
                                    )
                                }
                            >
                                <ArrowUpRight size={20} />
                            </button>
                        </div>
                        <div className="item">
                            <div className="infos">
                                <h2>Nouveautés</h2>
                                <p>Historique des versions</p>
                            </div>
                            <button
                                onClick={() => window.open("/new", "_blank")}
                            >
                                <ArrowUpRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Header() {
    return (
        <header className="header">
            <div className="top-bar">
                <div className="branding">
                    <img src="/logo96.png" alt="UNsalib logo" />
                    <h1>UNsalib</h1>
                </div>
                <div className="actions">
                    <IconButton
                        onClick={() => {
                            setModalContent(
                                <AboutModalContent></AboutModalContent>,
                            );
                            openModal();
                        }}
                        icon={<Info />}
                        secondary
                    />
                    <PWAInstallButton></PWAInstallButton>
                </div>
            </div>
            <div className="campus">
                <img className="banner" src={CampusBannerUrl} alt="" />

                <div className="overlay" />
                <div className="legend">Sciences et techniques</div>
            </div>
        </header>
    );
}

export { Header };
