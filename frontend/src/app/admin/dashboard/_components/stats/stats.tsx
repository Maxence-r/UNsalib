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
        const fetchDayUniqueHumanVisitors = async () => {
            try {
                setDayUniqueHumanVisitors(
                    (await getDayUniqueHumanVisitors()).toString(),
                );
            } catch (e) {
                console.error(e as string);
            }
        };
        const fetchDayUniqueVisitors = async () => {
            try {
                setDayUniqueVisitors((await getDayUniqueVisitors()).toString());
            } catch (e) {
                console.error(e as string);
            }
        };
        const fetchMonthUniqueHumanVisitors = async () => {
            try {
                setMonthUniqueHumanVisitors(
                    await getMonthUniqueHumanVisitors(),
                );
            } catch (e) {
                console.error(e as string);
            }
        };
        const fetchMonthUniqueVisitors = async () => {
            try {
                setMonthUniqueVisitors(await getMonthUniqueVisitors());
            } catch (e) {
                console.error(e as string);
            }
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
                                <Card
                                    isLoading={
                                        Object.keys(monthUniqueHumanVisitors)
                                            .length === 0 &&
                                        Object.keys(monthUniqueVisitors)
                                            .length === 0
                                    }
                                >
                                    <CardHeader>Visiteurs</CardHeader>
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
                                            chartId="month-unique-human-unique"
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
