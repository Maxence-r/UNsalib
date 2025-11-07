"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/_components/card";
import "./stats.css";
import { getDayUniqueHumanVisitors, getDayUniqueVisitors } from "../../_utils/client-actions";

export default function StatsPage() {
    const [dayUniqueHumanVisitors, setDayUniqueHumanVisitors] = useState<string>("-");
    const [dayUniqueVisitors, setDayUniqueVisitors] = useState<string>("-");

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const fetchDayUniqueHumanVisitors = async () => {
            const raw = await getDayUniqueHumanVisitors();
            setDayUniqueHumanVisitors(raw.data[today].toString());
        }
        const fetchDayUniqueVisitors = async () => {
            const raw = await getDayUniqueVisitors();
            setDayUniqueVisitors(raw.data[today].toString());
        }

        fetchDayUniqueHumanVisitors();
        fetchDayUniqueVisitors();
    }, [setDayUniqueHumanVisitors]);

    return (
        <div className="main dashboard-stats">
            <div className="view">
                <h2 className="view-title">Statistiques</h2>
                <div className="view-content">
                    <div className="section">
                        <h4 className="section-title">Aujourd&apos;hui</h4>
                        <div className="section-content">
                            <div className="column stats-overview">
                                <Card isLoading={dayUniqueVisitors === "-" ? true : false}>
                                    <CardHeader>Visiteurs uniques</CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueVisitors}</h1>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="column stats-overview">
                                <Card isLoading={dayUniqueHumanVisitors === "-" ? true : false}>
                                    <CardHeader>Visiteurs humains uniques</CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueHumanVisitors}</h1>
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