"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

import Button from "@/_components/button";
import { Card, CardContent, CardHeader, CardActions } from "@/_components/card";
import { SwitchView } from "@/_components/switch";
import { PieChart, LineChart } from "@/_components/chart";
import "./home.css";
import { getDayPlatforms, getDayUniqueVisitors, getDayViews, getSystemHealth, getAnalytics } from "../../_utils/client-actions";

export default function HomePage() {
    const [dayUniqueVisitors, setDayUniqueVisitors] = useState<string>("-");
    const [dayViews, setDayViews] = useState<string>("-");
    const [dayPlatforms, setDayPlatforms] = useState<{ empty: boolean, data: { legend: string, value: number }[] }>({
        empty: false,
        data: []
    });
    const [systemHealth, setSystemHealth] = useState<any>(null);
    const [weekTrend, setWeekTrend] = useState<{ date: string, value: number }[]>([]);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        
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
        const fetchSystemHealth = async () => {
            const result = await getSystemHealth();
            if (result.success) {
                setSystemHealth(result.data);
            }
        }
        const fetchWeekTrend = async () => {
            const result = await getAnalytics(weekAgo, today, 'unique-visitors');
            if (result.success) {
                const trend = Object.keys(result.data).map(date => ({
                    date,
                    value: result.data[date]
                }));
                setWeekTrend(trend);
            }
        }

        fetchDayUniqueVisitors();
        fetchDayViews();
        fetchDayPlatforms();
        fetchSystemHealth();
        fetchWeekTrend();
    }, [setDayUniqueVisitors, setDayViews, setDayPlatforms]);

    return (
        <div className="main dashboard-home">
            <div className="view">
                <h2 className="view-title">Accueil</h2>
                <div className="view-content">
                    <div className="section">
                        <h4 className="section-title">Santé du système</h4>
                        <div className="section-content health-grid">
                            <Card isLoading={!systemHealth}>
                                <CardHeader>
                                    <div className="health-header">
                                        {systemHealth?.status === 'healthy' ? 
                                            <CheckCircle size={20} color="#28a745" /> : 
                                            <AlertCircle size={20} color="#dc3545" />
                                        }
                                        Statut
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="health-status">
                                        <span className={`status-indicator ${systemHealth?.status}`}>
                                            {systemHealth?.status === 'healthy' ? 'En ligne' : 'Hors ligne'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card isLoading={!systemHealth}>
                                <CardHeader>
                                    <div className="health-header">
                                        <Database size={20} />
                                        Base de données
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="health-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Salles</span>
                                            <span className="stat-value">{systemHealth?.roomsCount || 0}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Cours</span>
                                            <span className="stat-value">{systemHealth?.coursesCount || 0}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Utilisateurs</span>
                                            <span className="stat-value">{systemHealth?.usersCount || 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card isLoading={!systemHealth}>
                                <CardHeader>
                                    <div className="health-header">
                                        <Clock size={20} />
                                        Dernière mise à jour
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="last-update">
                                        {systemHealth?.lastUpdate ? 
                                            new Date(systemHealth.lastUpdate).toLocaleString('fr-FR') : 
                                            'N/A'
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    
                    <div className="section">
                        <h4 className="section-title">Actions rapides</h4>
                        <div className="section-content">
                            <Card>
                                <CardHeader>Mode maintenance</CardHeader>
                                <CardContent>
                                    <SwitchView title="Activé" onCheck={() => console.log("enabled")} onUncheck={() => console.log("disabled")}></SwitchView>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    
                    <div className="section">
                        <h4 className="section-title">Statistiques du jour</h4>
                        <div className="section-content">
                            <div className="column stats-overview">
                                <Card isLoading={dayUniqueVisitors === "-" ? true : false}>
                                    <CardHeader>
                                        <div className="stat-header">
                                            <Activity size={20} />
                                            Visiteurs uniques
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueVisitors}</h1>
                                        <p className="stat-description">Aujourd&apos;hui</p>
                                    </CardContent>
                                </Card>
                                <Card isLoading={dayViews === "-" ? true : false}>
                                    <CardHeader>
                                        <div className="stat-header">
                                            <TrendingUp size={20} />
                                            Vues
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <h1>{dayViews}</h1>
                                        <p className="stat-description">Aujourd&apos;hui</p>
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

                    <div className="section">
                        <h4 className="section-title">Tendance de la semaine</h4>
                        <div className="section-content">
                            <Card isLoading={weekTrend.length === 0}>
                                <CardHeader>Visiteurs des 7 derniers jours</CardHeader>
                                <CardContent>
                                    <LineChart
                                        dataset={weekTrend}
                                        xLabel="Date"
                                        yLabel="Visiteurs"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}