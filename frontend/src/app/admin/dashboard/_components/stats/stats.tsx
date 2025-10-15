"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/_components/card";
import { PieChart, LineChart, BarChart } from "@/_components/chart";
import DateRangePicker, { DateRange } from "@/_components/daterangepicker";
import Button from "@/_components/button";
import { getAnalytics, exportData } from "../../_utils/client-actions";
import "./stats.css";

export default function StatsPage() {
    const [dateRange, setDateRange] = useState<DateRange>({
        start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    
    const [loading, setLoading] = useState(false);
    const [viewsData, setViewsData] = useState<any>({});
    const [visitorsData, setVisitorsData] = useState<any>({});
    const [browsersData, setBrowsersData] = useState<any>({});
    const [devicesData, setDevicesData] = useState<any>({});
    const [platformsData, setPlatformsData] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [views, visitors, browsers, devices, platforms] = await Promise.all([
                getAnalytics(dateRange.start, dateRange.end, 'views'),
                getAnalytics(dateRange.start, dateRange.end, 'unique-visitors'),
                getAnalytics(dateRange.start, dateRange.end, 'browsers'),
                getAnalytics(dateRange.start, dateRange.end, 'devices'),
                getAnalytics(dateRange.start, dateRange.end, 'platforms')
            ]);

            setViewsData(views.data);
            setVisitorsData(visitors.data);
            setBrowsersData(browsers.data);
            setDevicesData(devices.data);
            setPlatformsData(platforms.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const handleExport = async (format: 'json' | 'csv') => {
        await exportData('stats', format, dateRange);
    };

    // Process data for charts
    const viewsTrend = Object.keys(viewsData).map(date => ({
        date,
        value: viewsData[date]
    }));

    const visitorsTrend = Object.keys(visitorsData).map(date => ({
        date,
        value: visitorsData[date]
    }));

    // Aggregate browsers data across all dates
    const browsersAgg: { [key: string]: number } = {};
    Object.values(browsersData).forEach((day: any) => {
        Object.keys(day).forEach(browser => {
            browsersAgg[browser] = (browsersAgg[browser] || 0) + day[browser];
        });
    });
    const browsersPie = Object.keys(browsersAgg).map(browser => ({
        legend: browser,
        value: browsersAgg[browser]
    }));

    // Aggregate devices data across all dates
    const devicesAgg: { [key: string]: number } = {};
    Object.values(devicesData).forEach((day: any) => {
        Object.keys(day).forEach(device => {
            devicesAgg[device] = (devicesAgg[device] || 0) + day[device];
        });
    });
    const devicesPie = Object.keys(devicesAgg).map(device => ({
        legend: device === 'desktop' ? 'Ordinateur' : device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablette' : 'Bot',
        value: devicesAgg[device]
    }));

    // Aggregate platforms data across all dates
    const platformsAgg: { [key: string]: number } = {};
    Object.values(platformsData).forEach((day: any) => {
        Object.keys(day).forEach(platform => {
            platformsAgg[platform] = (platformsAgg[platform] || 0) + day[platform];
        });
    });
    const platformsBar = Object.keys(platformsAgg).map(platform => ({
        label: platform,
        value: platformsAgg[platform]
    }));

    // Calculate totals
    const totalViews = Object.values(viewsData).reduce((sum: number, val: any) => sum + val, 0);
    const totalVisitors = Object.values(visitorsData).reduce((sum: number, val: any) => sum + val, 0);
    const avgViewsPerDay = totalViews / Object.keys(viewsData).length || 0;
    const avgVisitorsPerDay = totalVisitors / Object.keys(visitorsData).length || 0;

    return (
        <div className="main dashboard-stats">
            <div className="view">
                <div className="view-header">
                    <h2 className="view-title">Statistiques</h2>
                    <div className="view-actions">
                        <Button onClick={() => fetchData()}>
                            <RefreshCw size={18} />
                            Actualiser
                        </Button>
                        <Button onClick={() => handleExport('json')}>
                            <Download size={18} />
                            JSON
                        </Button>
                        <Button onClick={() => handleExport('csv')}>
                            <Download size={18} />
                            CSV
                        </Button>
                    </div>
                </div>

                <div className="view-content">
                    <div className="section">
                        <h4 className="section-title">Période</h4>
                        <div className="section-content">
                            <DateRangePicker value={dateRange} onChange={setDateRange} />
                        </div>
                    </div>

                    <div className="section">
                        <h4 className="section-title">Vue d&apos;ensemble</h4>
                        <div className="section-content stats-grid">
                            <Card isLoading={loading}>
                                <CardHeader>Total des vues</CardHeader>
                                <CardContent>
                                    <h1>{totalViews.toLocaleString()}</h1>
                                    <p className="stat-subtitle">
                                        Moyenne: {Math.round(avgViewsPerDay)} / jour
                                    </p>
                                </CardContent>
                            </Card>
                            <Card isLoading={loading}>
                                <CardHeader>Visiteurs uniques</CardHeader>
                                <CardContent>
                                    <h1>{totalVisitors.toLocaleString()}</h1>
                                    <p className="stat-subtitle">
                                        Moyenne: {Math.round(avgVisitorsPerDay)} / jour
                                    </p>
                                </CardContent>
                            </Card>
                            <Card isLoading={loading}>
                                <CardHeader>Taux de pages/visiteur</CardHeader>
                                <CardContent>
                                    <h1>{(totalViews / totalVisitors || 0).toFixed(2)}</h1>
                                    <p className="stat-subtitle">
                                        Pages par visiteur
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="section">
                        <h4 className="section-title">Tendances</h4>
                        <div className="section-content charts-row">
                            <Card isLoading={loading}>
                                <CardHeader>Évolution des vues</CardHeader>
                                <CardContent>
                                    <LineChart
                                        dataset={viewsTrend}
                                        xLabel="Date"
                                        yLabel="Vues"
                                    />
                                </CardContent>
                            </Card>
                            <Card isLoading={loading}>
                                <CardHeader>Évolution des visiteurs</CardHeader>
                                <CardContent>
                                    <LineChart
                                        dataset={visitorsTrend}
                                        xLabel="Date"
                                        yLabel="Visiteurs"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="section">
                        <h4 className="section-title">Répartition</h4>
                        <div className="section-content charts-row">
                            <Card isLoading={loading}>
                                <CardHeader>Navigateurs</CardHeader>
                                <CardContent>
                                    <PieChart
                                        dataset={browsersPie}
                                        chartId="browsers-pie"
                                        sortDataset="asc"
                                    />
                                </CardContent>
                            </Card>
                            <Card isLoading={loading}>
                                <CardHeader>Types d&apos;appareils</CardHeader>
                                <CardContent>
                                    <PieChart
                                        dataset={devicesPie}
                                        chartId="devices-pie"
                                        sortDataset="asc"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="section">
                        <h4 className="section-title">Plateformes (OS)</h4>
                        <div className="section-content">
                            <Card isLoading={loading}>
                                <CardHeader>Systèmes d&apos;exploitation</CardHeader>
                                <CardContent>
                                    <BarChart
                                        dataset={platformsBar}
                                        xLabel="Plateforme"
                                        yLabel="Utilisateurs"
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
