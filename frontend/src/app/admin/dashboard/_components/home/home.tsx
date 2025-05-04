"use client";

import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";

import Button from "@/_components/button";
import { Card, CardContent, CardHeader, CardActions } from "@/_components/card";
import { SwitchView } from "@/_components/switch";
import { PieChart } from "@/_components/chart";
import "./home.css";
import { getDayPlatforms, getDayUniqueVisitors, getDayViews } from "../../_utils/client-actions";
import { subscribe, unsubscribe } from "../../_utils/events";

export default function HomePage() {
    const [dayUniqueVisitors, setDayUniqueVisitors] = useState<string>("-");
    const [dayViews, setDayViews] = useState<string>("-");
    const [dayPlatforms, setDayPlatforms] = useState<{ empty: boolean, data: { legend: string, value: number }[] }>({
        empty: false,
        data: []
    });
    const [statsSectionUpdate, setStatsSectionUpdate] = useState<string>(new Date().toTimeString().substring(0,5));

    const updateHome = async () => {
        const today = new Date().toISOString().split("T")[0];

        setDayUniqueVisitors((await getDayUniqueVisitors()).data[today].toString());

        setDayViews((await getDayViews()).data[today].toString());

        const rawPlatforms = await getDayPlatforms();
        const parsedPlatforms = Object.keys(rawPlatforms.data[today]).map(platform => ({
            legend: platform,
            value: rawPlatforms.data[today][platform]
        }));
        setDayPlatforms({ empty: parsedPlatforms.length === 0, data: parsedPlatforms });

        setStatsSectionUpdate(new Date().toTimeString().substring(0,5));
    }

    useEffect(() => {
        updateHome();
        subscribe("homeUpdated", updateHome);

        return () => {
            unsubscribe("homeUpdated", updateHome);
        }
    }, [setDayUniqueVisitors, setDayViews, setDayPlatforms]);

    return (
        <div className="main dashboard-home">
            <div className="view">
                <h2 className="view-title">Accueil</h2>
                <div className="view-content">
                    <div className="section">
                        <div className="section-title">
                            <h4>Actions rapides</h4>
                        </div>
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
                        <div className="section-title">
                            <h4>Statistiques d&apos;aujourd&apos;hui</h4>
                            <span>•</span>
                            <span>{statsSectionUpdate}</span>
                            <CircleCheck size={16} />
                        </div>
                        <div className="section-content">
                            <div className="column stats-overview">
                                <Card isLoading={dayUniqueVisitors === "-" ? true : false}>
                                    <CardHeader>Visiteurs uniques</CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueVisitors}</h1>
                                    </CardContent>
                                </Card>
                                <Card isLoading={dayViews === "-" ? true : false}>
                                    <CardHeader>Vues</CardHeader>
                                    <CardContent>
                                        <h1>{dayViews}</h1>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="column">
                                <Card isLoading={dayPlatforms.data.length === 0 && !dayPlatforms.empty ? true : false}>
                                    <CardHeader>Plateformes</CardHeader>
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