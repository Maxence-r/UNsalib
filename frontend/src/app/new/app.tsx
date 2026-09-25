"use client";

import Image from "next/image";
import { ArrowLeft, Star, X } from "lucide-react";

import Button from "@/_components/button";
import { VERSION_NUMBER } from "@/_utils/constants";
import { Card, CardContent } from "@/_components/card";

function ReleaseSection({ versionNumber, versionName, date, features }: { versionNumber: string, versionName: string, date: string, features: { icon: string, description: string }[] }) {
    return (
        <div className="section">
            <div className={`title ${versionNumber == VERSION_NUMBER ? "latest" : ""}`}>
                <h4>Version {versionNumber} {versionName != "" ? `"${versionName}"` : ""}</h4>
                <span>•</span>
                <span>{date}</span>
                {versionNumber == VERSION_NUMBER ? <Star size={20} /> : <></>}
            </div>
            <Card highlighted={versionNumber == VERSION_NUMBER}>
                <CardContent>
                    <ul className="features-list">
                        {features.map(feature => {
                            return (<li key={feature.description} className="feature"><i>{feature.icon}</i>{feature.description}</li>);
                        })}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

export default function App() {
    return (
        <div className="page">
            <div className="appbar">
                <Image className="logo" src="/logo96.png" alt="logo" width={96} height={96} />
                <h1>UNsalib</h1>
                <span className="spacer" />
                <Button id="home-mobile" withIcon iconOnly icon={<X size={20} />} onClick={() => window.close()}>Accueil</Button>
                <Button id="home" withIcon icon={<ArrowLeft size={20} />} onClick={() => window.close()}>Retour à UNsalib</Button>
            </div>
            <main tabIndex={-1} className="main new">
                <div className="content-container">
                    <h2 className="page-title">Journal des mises à jour</h2>
                    <ReleaseSection
                        versionNumber="2.4"
                        versionName="Barbara"
                        date="09/2026"
                        features={[
                            { icon: "💬", description: "Ajout d'un système de commentaires" },
                            { icon: "🛡️", description: "Améliorations diverses du tableau de bord administrateur" },
                            { icon: "🔧", description: "Ajout des modes vacances et maintenance" },
                            { icon: "🛠️", description: "Correction de bugs" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="2.3"
                        versionName="Barbara"
                        date="11/2025"
                        features={[
                            { icon: "🛠️", description: "Mise à jour du système de synchronisation des emplois du temps suite à la modification de noms de salles par Nantes Université" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="2.2"
                        versionName="Barbara"
                        date="09/2025"
                        features={[
                            { icon: "📅", description: "Le nom du mois est désormais affiché sur le calendrier, sous le numéro de semaine" },
                            { icon: "📅", description: "Ajout d'un bouton pour revenir rapidement à la semaine actuelle" },
                            { icon: "🛠️", description: "Amélioration de l'algorithme de récupération et de traitement des groupes" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="2.1"
                        versionName="Barbara"
                        date="04/2025"
                        features={[
                            { icon: "⚡", description: "Optimisation du code côté client" },
                            { icon: "📜", description: "Ajout d'une page recensant l'historique des versions" },
                            { icon: "🛠️", description: "Correction de bugs" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="2.0"
                        versionName="Barbara"
                        date="03/2025"
                        features={[
                            { icon: "🌙", description: "Mode sombre automatique pour protéger les yeux" },
                            { icon: "📱", description: "Navigation sur mobile comme dans une vraie app, avec la prise en charge du bouton de retour" },
                            { icon: "🦾", description: "Interface plus rapide et plus fiable grâce à la réécriture du code client en React" },
                            { icon: "⚡", description: "Amélioration du temps de chargement des emplois du temps côté serveur" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="1.1"
                        versionName=""
                        date="02/2025"
                        features={[
                            { icon: "🛠️", description: "Correction de plusieurs bugs dans l'algorithme de synchronisation des cours affectant de façon critique la fiabilité d'UNsalib" },
                            { icon: "🛠️", description: "Correction des erreurs accumulées dans la base de données" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="1.0"
                        versionName=""
                        date="01/2025"
                        features={[
                            { icon: "⚙️", description: "Nouvel algorithme de synchronisation des emplois du temps pour gérer la suppression et la modification de cours" },
                            { icon: "📅", description: "Gestion de l'affichage des cours concurrents côté client" },
                            { icon: "⚡", description: "Amélioration du temps de traitement des requêtes côté serveur" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="BETA"
                        versionName=""
                        date="12/2024"
                        features={[
                            { icon: "📱", description: "Transformation en PWA pour rendre l'installation possible sur les navigateurs compatibles" },
                            { icon: "✏️", description: "Ajout d'un tableau de bord administrateur pour gérer les salles facilement" },
                            { icon: "🛠️", description: "Correction de bugs et amélioration de l'apparence" }
                        ]}
                    />
                    <ReleaseSection
                        versionNumber="BETA"
                        versionName=""
                        date="11/2024"
                        features={[
                            { icon: "🔍", description: "Recherche de salles libres" },
                            { icon: "📅", description: "Consultation des emplois du temps de salles" },
                            { icon: "📱", description: "Interface moderne et responsive" }
                        ]}
                    />
                </div>
            </main>
        </div>
    );
}