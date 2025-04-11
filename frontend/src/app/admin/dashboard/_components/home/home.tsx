"use client";

import { useEffect, useState } from "react";

import Button from "@/_components/button";
import { Card, CardContent, CardHeader, CardActions } from "@/_components/card";
import { SwitchView } from "@/_components/switch";
import { PieChart } from "@/_components/chart";
import "./home.css";
import { getDayUniqueVisitors } from "../../_utils/client-actions";


export default function HomePage() {
    const [dayUniqueVisitors, setDayUniqueVisitors] = useState(0);

    useEffect(() => {
        const fetchDayUniqueVisitors = async () => {
            const today = new Date().toISOString().split("T")[0];
            const raw = await getDayUniqueVisitors();
            setDayUniqueVisitors(raw.data[today]);
        }

        fetchDayUniqueVisitors();
    }, [dayUniqueVisitors, setDayUniqueVisitors])

    return (
        <div className="main dashboard-home">
            <div className="view">
                <h2 className="view-title">Accueil</h2>
                <div className="view-content">
                    <div className="section">
                        <h4 className="section-title">Actions rapides</h4>
                        <div className="section-content">
                            <Card>
                                <CardHeader>Mode maintenance</CardHeader>
                                <CardContent>
                                    <SwitchView title="Activé" onCheck={() => console.log("enabled")} onUncheck={() => console.log("disabled")}></SwitchView>
                                </CardContent>
                            </Card>
                            <Card highlighted>
                                <CardHeader>Nouvelles salles</CardHeader>
                                <CardContent>
                                    Aucune nouvelle salle.
                                </CardContent>
                                <CardActions><Button>Test</Button></CardActions>
                            </Card>
                            <Card>
                                <CardHeader>Santé</CardHeader>
                                <CardContent>
                                    OK
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="section">
                        <h4 className="section-title">Statistiques globales</h4>
                        <div className="section-content">
                            <div className="column stats-overview">
                                <Card>
                                    <CardHeader>Visiteurs uniques aujourd&apos;hui</CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueVisitors}</h1>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>Vues aujourd&apos;hui</CardHeader>
                                    <CardContent>
                                        <h1>100</h1>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="column">
                                <Card>
                                    <CardHeader>Plateformes</CardHeader>
                                    <CardContent>
                                        <PieChart
                                            dataset={
                                                [
                                                    { legend: "Toto", value: 50 },
                                                    { legend: "Tata", value: 100 },
                                                    { legend: "Tutu", value: 200 }
                                                ]
                                            }
                                            sortDataset="asc"
                                            chartId="platforms"
                                        ></PieChart>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}