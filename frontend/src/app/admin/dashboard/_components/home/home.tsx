"use client";

import { useEffect, useState } from "react";

import Button from "@/_components/button";
import { Card, CardContent, CardHeader, CardActions } from "@/_components/card";
import { SwitchView } from "@/_components/switch";
import { PieChart } from "@/_components/chart";
import "./home.css";
import { getDayPlatforms, getDayUniqueVisitors, getDayViews } from "../../_utils/client-actions";

export default function HomePage() {
    const [dayUniqueVisitors, setDayUniqueVisitors] = useState<string>("-");
    const [dayViews, setDayViews] = useState<string>("-");
    const [dayPlatforms, setDayPlatforms] = useState<{ empty: boolean, data: { legend: string, value: number }[] }>({
        empty: false,
        data: []
    });

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const fetchDayUniqueVisitors = async () => {
            const raw = await getDayUniqueVisitors();
            setDayUniqueVisitors(raw.data[today].toString());
        }
        const fetchDayViews = async () => {
            const raw = await getDayViews();
            setDayViews(raw.data[today].toString());
        }
        const fetchDayPlatforms = async () => {
            const raw = await getDayPlatforms();
            const parsedPlatforms = Object.keys(raw.data[today]).map(platform => ({
                legend: platform,
                value: raw.data[today][platform]
            }));
            setDayPlatforms({ empty: parsedPlatforms.length === 0, data: parsedPlatforms });
        }

        fetchDayUniqueVisitors();
        fetchDayViews();
        fetchDayPlatforms();
    }, [setDayUniqueVisitors, setDayViews, setDayPlatforms]);

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
                        <h4 className="section-title">Statistiques du jour</h4>
                        <div className="section-content">
                            <div className="column stats-overview">
                                <Card isLoading={dayUniqueVisitors === "-" ? true : false}>
                                    <CardHeader>Visiteurs uniques aujourd&apos;hui</CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueVisitors}</h1>
                                    </CardContent>
                                </Card>
                                <Card isLoading={dayViews === "-" ? true : false}>
                                    <CardHeader>Vues aujourd&apos;hui</CardHeader>
                                    <CardContent>
                                        <h1>{dayViews}</h1>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="column">
                                <Card isLoading={dayPlatforms.data.length === 0 && !dayPlatforms.empty ? true : false}>
                                    <CardHeader>Plateformes aujourd&apos;hui</CardHeader>
                                    <CardContent>
                                        <PieChart
                                            dataset={dayPlatforms.data}
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