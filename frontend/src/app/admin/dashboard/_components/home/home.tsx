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
    const [dayPlatforms, setDayPlatforms] = useState<{ legend: string, value: number }[]>([]);

    useEffect(() => {
        const fetchDayUniqueVisitors = async () => {
            const today = new Date().toISOString().split("T")[0];
            const raw = await getDayUniqueVisitors();
            setDayUniqueVisitors(raw.data[today].toString());
        }

        fetchDayUniqueVisitors();
    }, [setDayUniqueVisitors])

    useEffect(() => {
        const fetchDayViews = async () => {
            const today = new Date().toISOString().split("T")[0];
            const raw = await getDayViews();
            setDayViews(raw.data[today].toString());
        }

        fetchDayViews();
    }, [setDayViews])

    useEffect(() => {
        const fetchDayPlatforms = async () => {
            const today = new Date().toISOString().split("T")[0];
            const raw = await getDayPlatforms();
            setDayPlatforms(Object.keys(raw.data[today]).map(platform => ({ 
                legend: platform, 
                value: raw.data[today][platform]
            })));
        }

        fetchDayPlatforms();
    }, [setDayPlatforms])

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
                                <Card isLoading={dayPlatforms.length === 0 ? true : false}>
                                    <CardHeader>Plateformes aujourd'hui</CardHeader>
                                    <CardContent>
                                        <PieChart
                                            dataset={dayPlatforms}
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