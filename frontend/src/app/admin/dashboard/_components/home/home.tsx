"use client";

import { useEffect, useState } from "react";

import Button from "@/_components/button";
import { Card, CardContent, CardHeader, CardActions } from "@/_components/card";
import { SwitchView } from "@/_components/switch";
import { PieChart } from "@/_components/chart";
import { setToastMessage, showToast } from "@/_components/toast";
import { ApiAppState } from "@/_utils/api-types";
import "./home.css";
import {
    getAppState,
    getDayPlatforms,
    getDayUniqueVisitors,
    getDayViews,
    updateAppState,
} from "../../_utils/client-actions";

export default function HomePage() {
    const [dayUniqueVisitors, setDayUniqueVisitors] = useState<string>("-");
    const [dayViews, setDayViews] = useState<string>("-");
    const [appState, setAppState] = useState<ApiAppState>({
        maintenance: false,
        vacation: false,
    });
    const [isAppStateLoading, setIsAppStateLoading] = useState(true);
    const [savingMode, setSavingMode] = useState<keyof ApiAppState | null>(null);
    const [dayPlatforms, setDayPlatforms] = useState<{
        empty: boolean;
        data: { legend: string; value: number }[];
    }>({
        empty: false,
        data: [],
    });

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const fetchAppState = async () => {
            try {
                setAppState(await getAppState());
            } catch (e) {
                console.error(e as string);
                setToastMessage("Impossible de récupérer le mode actuel.", true);
                showToast();
            } finally {
                setIsAppStateLoading(false);
            }
        };
        const fetchDayUniqueVisitors = async () => {
            try {
                setDayUniqueVisitors((await getDayUniqueVisitors()).toString());
            } catch (e) {
                console.error(e as string);
            }
        };
        const fetchDayViews = async () => {
            try {
                setDayViews((await getDayViews()).toString());
            } catch (e) {
                console.error(e as string);
            }
        };
        const fetchDayPlatforms = async () => {
            try {
                const raw = await getDayPlatforms();
                const parsedPlatforms = Object.keys(raw[today]).map(
                    (platform) => ({
                        legend: platform,
                        value: raw[today][platform],
                    }),
                );
                setDayPlatforms({
                    empty: parsedPlatforms.length === 0,
                    data: parsedPlatforms,
                });
            } catch (e) {
                console.error(e as string);
            }
        };

        fetchAppState();
        fetchDayUniqueVisitors();
        fetchDayViews();
        fetchDayPlatforms();
    }, []);

    const updateMode = async (mode: keyof ApiAppState, enabled: boolean) => {
        const previousState = appState;
        const nextState = {
            ...appState,
            [mode]: enabled,
            ...(enabled && mode === "maintenance" ? { vacation: false } : {}),
            ...(enabled && mode === "vacation" ? { maintenance: false } : {}),
        };

        setSavingMode(mode);
        setAppState(nextState);

        const result = await updateAppState({ [mode]: enabled });
        setSavingMode(null);

        if (!result.success || !result.state) {
            setAppState(previousState);
            setToastMessage("Le mode n'a pas pu être modifié.", true);
            showToast();
            return;
        }

        setAppState(result.state);
        setToastMessage("Mode mis à jour.");
        showToast();
    };

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
                                    <SwitchView
                                        title={appState.maintenance ? "Actif" : "Inactif"}
                                        description="Affiche la page de maintenance à la place de l'application."
                                        checked={appState.maintenance}
                                        disabled={isAppStateLoading || savingMode !== null}
                                        onChange={(checked) => updateMode("maintenance", checked)}
                                    ></SwitchView>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>Mode vacances</CardHeader>
                                <CardContent>
                                    <SwitchView
                                        title={appState.vacation ? "Actif" : "Inactif"}
                                        description="Affiche le message de vacances jusqu'à la rentrée."
                                        checked={appState.vacation}
                                        disabled={isAppStateLoading || savingMode !== null}
                                        onChange={(checked) => updateMode("vacation", checked)}
                                    ></SwitchView>
                                </CardContent>
                            </Card>
                            <Card highlighted>
                                <CardHeader>Nouvelles salles</CardHeader>
                                <CardContent>
                                    Aucune nouvelle salle.
                                </CardContent>
                                <CardActions>
                                    <Button>Test</Button>
                                </CardActions>
                            </Card>
                            <Card>
                                <CardHeader>Santé</CardHeader>
                                <CardContent>OK</CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="section">
                        <h4 className="section-title">Statistiques du jour</h4>
                        <div className="section-content">
                            <div className="column stats-overview">
                                <Card
                                    isLoading={
                                        dayUniqueVisitors === "-" ? true : false
                                    }
                                >
                                    <CardHeader>
                                        Visiteurs uniques aujourd&apos;hui
                                    </CardHeader>
                                    <CardContent>
                                        <h1>{dayUniqueVisitors}</h1>
                                    </CardContent>
                                </Card>
                                <Card
                                    isLoading={dayViews === "-" ? true : false}
                                >
                                    <CardHeader>
                                        Vues aujourd&apos;hui
                                    </CardHeader>
                                    <CardContent>
                                        <h1>{dayViews}</h1>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="column">
                                <Card
                                    isLoading={
                                        dayPlatforms.data.length === 0 &&
                                        !dayPlatforms.empty
                                            ? true
                                            : false
                                    }
                                >
                                    <CardHeader>
                                        Plateformes aujourd&apos;hui
                                    </CardHeader>
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
