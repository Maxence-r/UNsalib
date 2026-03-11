"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/_components/card";
import { BarChart, PieChart } from "@/_components/chart";
import "./stats.css";
import {
    ApiAdminStatsOverview,
    ApiStatsDailyPoint,
    ApiStatsMonthlyPoint,
    ApiStatsTotals,
} from "@/_utils/api-types";
import { getStatsOverview } from "../../_utils/client-actions";

const MONTH_LABELS = [
    "Janv.",
    "Fevr.",
    "Mars",
    "Avr.",
    "Mai",
    "Juin",
    "Juil.",
    "Aout",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dec.",
];

const EMPTY_TOTALS: ApiStatsTotals = {
    uniqueVisitors: 0,
    uniqueHumanVisitors: 0,
    views: 0,
    roomRequests: 0,
    availableRoomsRequests: 0,
    internalErrors: 0,
};

function formatNumber(value: number) {
    return new Intl.NumberFormat("fr-FR").format(value);
}

function getCurrentPeriod() {
    const now = new Date();
    return {
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
    };
}

function formatMonthDay(date: string) {
    const [, month, day] = date.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${day} ${MONTH_LABELS[monthIndex]}`;
}

function formatFullDate(date: string) {
    const [year, month, day] = date.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${day} ${MONTH_LABELS[monthIndex]} ${year}`;
}

function toPieDataset(values: Record<string, number>) {
    return Object.entries(values)
        .filter(([, value]) => value > 0)
        .sort(([, valueA], [, valueB]) => valueB - valueA)
        .map(([legend, value]) => ({ legend, value }));
}

function getTrafficAverage(total: number, activeDays: number) {
    if (activeDays === 0) {
        return "0";
    }
    return formatNumber(Math.round(total / activeDays));
}

function getActiveMonths(months: ApiStatsMonthlyPoint[]) {
    return months.filter((month) => month.uniqueHumanVisitors > 0).length;
}

function getTopDays(days: ApiStatsDailyPoint[]) {
    return [...days]
        .filter((day) => day.uniqueHumanVisitors > 0)
        .sort((a, b) => {
            if (b.uniqueHumanVisitors !== a.uniqueHumanVisitors) {
                return b.uniqueHumanVisitors - a.uniqueHumanVisitors;
            }
            if (b.availableRoomsRequests !== a.availableRoomsRequests) {
                return b.availableRoomsRequests - a.availableRoomsRequests;
            }
            return b.roomRequests - a.roomRequests;
        })
        .slice(0, 5);
}

function getTopMonths(months: ApiStatsMonthlyPoint[]) {
    return [...months]
        .filter((month) => month.uniqueHumanVisitors > 0)
        .sort((a, b) => {
            if (b.uniqueHumanVisitors !== a.uniqueHumanVisitors) {
                return b.uniqueHumanVisitors - a.uniqueHumanVisitors;
            }
            if (b.availableRoomsRequests !== a.availableRoomsRequests) {
                return b.availableRoomsRequests - a.availableRoomsRequests;
            }
            return b.roomRequests - a.roomRequests;
        })
        .slice(0, 4);
}

function MetricCard({
    title,
    value,
    note,
    highlighted,
    compact,
    isLoading,
}: {
    title: string;
    value: string;
    note: string;
    highlighted?: boolean;
    compact?: boolean;
    isLoading: boolean;
}) {
    return (
        <Card
            className={`metric-card${compact ? " compact" : ""}`}
            highlighted={highlighted ?? false}
            isLoading={isLoading}
        >
            <div className="metric-label">{title}</div>
            <h3 className="metric-value">{value}</h3>
            <p className="metric-note">{note}</p>
        </Card>
    );
}

function RankingCard({
    title,
    description,
    emptyLabel,
    items,
    isLoading,
}: {
    title: string;
    description: string;
    emptyLabel: string;
    items: {
        id: string;
        title: string;
        meta: string;
        value: string;
    }[];
    isLoading: boolean;
}) {
    return (
        <Card className="ranking-card" isLoading={isLoading}>
            <CardHeader>{title}</CardHeader>
            <CardContent>
                <p className="card-subtitle">{description}</p>
                {items.length > 0 ? (
                    <div className="ranking-list">
                        {items.map((item, index) => (
                            <div className="ranking-item" key={item.id}>
                                <div className="ranking-copy">
                                    <div className="ranking-index">
                                        {index + 1}
                                    </div>
                                    <div className="ranking-text">
                                        <div className="ranking-title">
                                            {item.title}
                                        </div>
                                        <div className="ranking-meta">
                                            {item.meta}
                                        </div>
                                    </div>
                                </div>
                                <div className="ranking-value">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">{emptyLabel}</div>
                )}
            </CardContent>
        </Card>
    );
}

export default function StatsPage() {
    const currentPeriod = getCurrentPeriod();
    const [selectedYear, setSelectedYear] = useState(currentPeriod.year);
    const [selectedMonth, setSelectedMonth] = useState(currentPeriod.month);
    const [overview, setOverview] = useState<ApiAdminStatsOverview | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;

        async function fetchOverview() {
            setIsLoading(true);

            try {
                const response = await getStatsOverview(
                    selectedYear,
                    selectedMonth,
                );

                if (!isCancelled) {
                    setOverview(response);
                }
            } catch (error) {
                console.error(error as string);
                if (!isCancelled) {
                    setOverview(null);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchOverview();

        return () => {
            isCancelled = true;
        };
    }, [selectedYear, selectedMonth]);

    const availableYears =
        overview?.availableYears.length && overview.availableYears.length > 0
            ? overview.availableYears
            : [selectedYear];

    const todayTotals = overview?.today ?? {
        date: `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}-01`,
        ...EMPTY_TOTALS,
    };
    const monthTotals = overview?.month.totals ?? EMPTY_TOTALS;
    const yearTotals = overview?.year.totals ?? EMPTY_TOTALS;
    const monthActiveDays = overview?.month.activeDays ?? 0;
    const peakDay = overview?.month.peakDay;
    const peakMonth = overview?.year.peakMonth;
    const activeMonths = getActiveMonths(overview?.year.monthlyStats ?? []);

    const yearlyAudienceDataset = (overview?.year.monthlyStats ?? []).map(
        (month) => ({
            legend: month.label,
            y: [
                {
                    value: month.uniqueHumanVisitors,
                    group: "Audience humaine",
                },
            ],
        }),
    );

    const dailyAudienceDataset = (overview?.month.dailyStats ?? []).map(
        (day) => ({
            legend: day.label,
            y: [
                {
                    value: day.uniqueHumanVisitors,
                    group: "Audience humaine",
                },
            ],
        }),
    );

    const dailyActivityDataset = (overview?.month.dailyStats ?? []).map(
        (day) => ({
            legend: day.label,
            y: [
                {
                    value: day.roomRequests,
                    group: "EDT charges",
                },
                {
                    value: day.availableRoomsRequests,
                    group: "Recherches",
                },
            ],
        }),
    );

    const osDataset = toPieDataset(overview?.month.platforms.os ?? {});
    const browserDataset = toPieDataset(
        overview?.month.platforms.browsers ?? {},
    );

    const topMonths = getTopMonths(overview?.year.monthlyStats ?? []).map(
        (month) => ({
            id: month.label,
            title: month.label,
            meta: `${formatNumber(month.availableRoomsRequests)} recherches, ${formatNumber(month.roomRequests)} EDT`,
            value: formatNumber(month.uniqueHumanVisitors),
        }),
    );

    const topDays = getTopDays(overview?.month.dailyStats ?? []).map((day) => ({
        id: day.date,
        title: formatMonthDay(day.date),
        meta: `${formatNumber(day.availableRoomsRequests)} recherches, ${formatNumber(day.roomRequests)} EDT`,
        value: formatNumber(day.uniqueHumanVisitors),
    }));

    return (
        <div className="main dashboard-stats">
            <div className="view">
                <h2 className="view-title">Statistiques</h2>
                <div className="view-content">
                    <div className="section">
                        <h4 className="section-title">Aujourdhui</h4>
                        <div className="today-grid">
                            <MetricCard
                                title="Vues humaines reelles"
                                value={formatNumber(
                                    todayTotals.uniqueHumanVisitors,
                                )}
                                note={`Le ${formatFullDate(todayTotals.date)}`}
                                compact
                                highlighted
                                isLoading={isLoading}
                            />
                            <MetricCard
                                title="Recherches de salles"
                                value={formatNumber(
                                    todayTotals.availableRoomsRequests,
                                )}
                                note={`Le ${formatFullDate(todayTotals.date)}`}
                                compact
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                    <div className="section">
                        <Card
                            className="period-card"
                            elevated
                            isLoading={isLoading}
                        >
                            <div className="period-toolbar">
                                <div className="period-copy">
                                    <span className="eyebrow">
                                        Lecture de la periode
                                    </span>
                                    <h3>
                                        {overview?.month.label ??
                                            `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}`}
                                    </h3>
                                    <p>
                                        Toute la lecture visible privilegie les
                                        vues humaines reelles. Les recherches et
                                        les chargements EDT restent visibles
                                        sans modifier la collecte.
                                    </p>
                                </div>
                                <label className="period-select">
                                    <span>Annee</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(event) =>
                                            setSelectedYear(
                                                parseInt(
                                                    event.target.value,
                                                    10,
                                                ),
                                            )
                                        }
                                    >
                                        {availableYears.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="month-grid">
                                {MONTH_LABELS.map((label, index) => {
                                    const monthValue = index + 1;
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                            className={`month-pill ${
                                                selectedMonth === monthValue
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedMonth(monthValue)
                                            }
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    <div className="section">
                        <h4 className="section-title">Synthese du mois</h4>
                        <div className="summary-grid">
                            <MetricCard
                                title="Audience humaine du mois"
                                value={formatNumber(
                                    monthTotals.uniqueHumanVisitors,
                                )}
                                note={`${monthActiveDays} jours avec vue humaine`}
                                highlighted
                                isLoading={isLoading}
                            />
                            <MetricCard
                                title="Recherches de salles"
                                value={formatNumber(
                                    monthTotals.availableRoomsRequests,
                                )}
                                note={`${getTrafficAverage(monthTotals.availableRoomsRequests, monthActiveDays)} par jour humain actif`}
                                isLoading={isLoading}
                            />
                            <MetricCard
                                title="EDT charges"
                                value={formatNumber(monthTotals.roomRequests)}
                                note={`${getTrafficAverage(monthTotals.roomRequests, monthActiveDays)} par jour humain actif`}
                                isLoading={isLoading}
                            />
                            <MetricCard
                                title="Jour fort du mois"
                                value={
                                    peakDay
                                        ? formatMonthDay(peakDay.date)
                                        : "Aucun"
                                }
                                note={
                                    peakDay
                                        ? `${formatNumber(peakDay.uniqueHumanVisitors)} vues humaines`
                                        : "Aucune activite humaine"
                                }
                                isLoading={isLoading}
                            />
                            <MetricCard
                                title="Erreurs internes"
                                value={formatNumber(monthTotals.internalErrors)}
                                note="Incidents enregistres sur la periode"
                                isLoading={isLoading}
                            />
                        </div>
                    </div>

                    <div className="section">
                        <h4 className="section-title">
                            Vue annuelle {selectedYear}
                        </h4>
                        <div className="stats-grid">
                            <Card
                                className="chart-card chart-span-2"
                                isLoading={isLoading}
                            >
                                <CardHeader>Audience humaine annuelle</CardHeader>
                                <CardContent>
                                    <p className="card-subtitle">
                                        Somme mensuelle des vues humaines
                                        quotidiennes. Cliquez sur une barre
                                        pour lire la valeur exacte.
                                    </p>
                                    <BarChart
                                        style={{ height: 320 }}
                                        dataset={yearlyAudienceDataset}
                                        chartId="yearly-audience"
                                    />
                                </CardContent>
                            </Card>
                            <Card
                                className="insight-card"
                                isLoading={isLoading}
                            >
                                <CardHeader>Reperes annuels</CardHeader>
                                <CardContent>
                                    <div className="insight-list">
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Audience humaine annuelle
                                            </span>
                                            <strong>
                                                {formatNumber(
                                                    yearTotals.uniqueHumanVisitors,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Recherches de salles
                                            </span>
                                            <strong>
                                                {formatNumber(
                                                    yearTotals.availableRoomsRequests,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                EDT charges
                                            </span>
                                            <strong>
                                                {formatNumber(
                                                    yearTotals.roomRequests,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Mois avec vue humaine
                                            </span>
                                            <strong>{activeMonths}</strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Mois fort
                                            </span>
                                            <strong>
                                                {peakMonth
                                                    ? peakMonth.label
                                                    : "Aucun"}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Erreurs internes
                                            </span>
                                            <strong>
                                                {formatNumber(
                                                    yearTotals.internalErrors,
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <RankingCard
                                title="Mois les plus actifs"
                                description="Classement par vues humaines reelles. Les recherches et EDT servent seulement de departage."
                                emptyLabel="Aucune activite humaine annuelle."
                                items={topMonths}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                    <div className="section">
                        <h4 className="section-title">
                            Detail de {overview?.month.label ??
                                `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}`}
                        </h4>
                        <div className="stats-grid">
                            <Card
                                className="chart-card chart-span-2"
                                isLoading={isLoading}
                            >
                                <CardHeader>Audience par jour</CardHeader>
                                <CardContent>
                                    <p className="card-subtitle">
                                        Lecture quotidienne des vues humaines
                                        reelles. Cliquez sur une barre pour
                                        lire la valeur exacte.
                                    </p>
                                    <BarChart
                                        style={{ height: 320 }}
                                        dataset={dailyAudienceDataset}
                                        chartId="daily-audience"
                                    />
                                </CardContent>
                            </Card>
                            <Card
                                className="chart-card chart-span-2"
                                isLoading={isLoading}
                            >
                                <CardHeader>Activite par jour</CardHeader>
                                <CardContent>
                                    <p className="card-subtitle">
                                        Comparaison entre chargements EDT et
                                        recherches de salles. Cliquez sur une
                                        barre pour lire la valeur exacte.
                                    </p>
                                    <BarChart
                                        style={{ height: 320 }}
                                        dataset={dailyActivityDataset}
                                        chartId="daily-activity"
                                    />
                                </CardContent>
                            </Card>
                            <Card className="chart-card" isLoading={isLoading}>
                                <CardHeader>Plateformes du mois</CardHeader>
                                <CardContent>
                                    <p className="card-subtitle">
                                        Repartition des systemes dexploitation
                                        humains connus sur la periode.
                                        Cliquez sur une part pour lire la
                                        valeur exacte.
                                    </p>
                                    <PieChart
                                        dataset={osDataset}
                                        sortDataset="asc"
                                        chartId="month-platforms"
                                    />
                                </CardContent>
                            </Card>
                            <Card className="chart-card" isLoading={isLoading}>
                                <CardHeader>Navigateurs du mois</CardHeader>
                                <CardContent>
                                    <p className="card-subtitle">
                                        Repartition des navigateurs humains
                                        connus sur la periode. Cliquez sur une
                                        part pour lire la valeur exacte.
                                    </p>
                                    <PieChart
                                        dataset={browserDataset}
                                        sortDataset="asc"
                                        chartId="month-browsers"
                                    />
                                </CardContent>
                            </Card>
                            <RankingCard
                                title="Jours les plus actifs"
                                description="Les jours sont tries par vues humaines reelles. Les recherches et EDT servent seulement de departage."
                                emptyLabel="Aucune journee humaine active sur ce mois."
                                items={topDays}
                                isLoading={isLoading}
                            />
                            <Card
                                className="insight-card"
                                isLoading={isLoading}
                            >
                                <CardHeader>Qualite de lecture</CardHeader>
                                <CardContent>
                                    <div className="insight-list">
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Vues humaines du mois
                                            </span>
                                            <strong>
                                                {formatNumber(
                                                    monthTotals.uniqueHumanVisitors,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Jours avec vue humaine
                                            </span>
                                            <strong>{monthActiveDays}</strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Moyenne humaine par jour actif
                                            </span>
                                            <strong>
                                                {getTrafficAverage(
                                                    monthTotals.uniqueHumanVisitors,
                                                    monthActiveDays,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Moyenne recherches par jour actif
                                            </span>
                                            <strong>
                                                {getTrafficAverage(
                                                    monthTotals.availableRoomsRequests,
                                                    monthActiveDays,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Jour fort
                                            </span>
                                            <strong>
                                                {peakDay
                                                    ? formatMonthDay(
                                                          peakDay.date,
                                                      )
                                                    : "Aucun"}
                                            </strong>
                                        </div>
                                        <div className="insight-item">
                                            <span className="insight-label">
                                                Erreurs internes
                                            </span>
                                            <strong>
                                                {formatNumber(
                                                    monthTotals.internalErrors,
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
