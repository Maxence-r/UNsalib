"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/_components/card";
import { BarChart } from "@/_components/chart";
import "./stats.css";
import { ApiUniqueHumanVisitors, ApiUniqueVisitors } from "@/_utils/api-types";
import {
    getDayUniqueHumanVisitors,
    getDayUniqueVisitors,
    getMonthUniqueHumanVisitors,
    getMonthUniqueVisitors,
} from "../../_utils/client-actions";

export default function StatsPage() {
    const [dayUniqueHumanVisitors, setDayUniqueHumanVisitors] =
        useState<string>("-");
    const [monthUniqueHumanVisitors, setMonthUniqueHumanVisitors] =
        useState<ApiUniqueHumanVisitors>({});
    const [monthUniqueVisitors, setMonthUniqueVisitors] =
        useState<ApiUniqueVisitors>({});
    const [dayUniqueVisitors, setDayUniqueVisitors] = useState<string>("-");

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const fetchDayUniqueHumanVisitors = async () => {
            const raw = await getDayUniqueHumanVisitors();
            setDayUniqueHumanVisitors(raw.data[today].toString());
        };
        const fetchDayUniqueVisitors = async () => {
            const raw = await getDayUniqueVisitors();
            setDayUniqueVisitors(raw.data[today].toString());
        };
        const fetchMonthUniqueHumanVisitors = async () => {
            setMonthUniqueHumanVisitors(await getMonthUniqueHumanVisitors());
        };
        const fetchMonthUniqueVisitors = async () => {
            setMonthUniqueVisitors(await getMonthUniqueVisitors());
        };

        fetchDayUniqueHumanVisitors();
        fetchDayUniqueVisitors();
        fetchMonthUniqueHumanVisitors();
        fetchMonthUniqueVisitors();
    }, []);

    return (
        <div className="main dashboard-stats">
            <div className="view">
                <h2 className="view-title">Statistiques</h2>
                <div className="view-content">
                    <div className="section">
                        <h4 className="section-title">Aujourd&apos;hui</h4>
                        <div className="section-content">
                            <div className="column stats-overview">
                                <Card
                                    isLoading={
                                        dayUniqueVisitors === "-" ? true : false
                                    }
                                >
                                    <CardHeader>Visiteurs uniques</CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueVisitors}</h1>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="column stats-overview">
                                <Card
                                    isLoading={
                                        dayUniqueHumanVisitors === "-"
                                            ? true
                                            : false
                                    }
                                >
                                    <CardHeader>
                                        Visiteurs humains uniques
                                    </CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueHumanVisitors}</h1>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                    <div className="section">
                        <h4 className="section-title">Ce mois-ci</h4>
                        <div className="section-content">
                            <div style={{ maxWidth: "100%" }}>
                                <Card>
                                    <CardHeader>Visites</CardHeader>
                                    <CardContent>
                                        <BarChart
                                            style={{ height: 200 }}
                                            dataset={Object.keys(
                                                monthUniqueVisitors,
                                            ).map((day) => ({
                                                legend: day.substring(
                                                    day.length - 2,
                                                    day.length,
                                                ),
                                                y: [
                                                    {
                                                        value: monthUniqueVisitors[
                                                            day
                                                        ],
                                                        group: "Visiteurs uniques",
                                                    },
                                                    {
                                                        value: monthUniqueHumanVisitors[
                                                            day
                                                        ],
                                                        group: "Visiteurs humains uniques",
                                                    },
                                                ],
                                            }))}
                                            chartId="platforms"
                                        />
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
