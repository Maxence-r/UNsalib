"use client";

import { useEffect, useState } from "react";
import { VictoryPie } from "victory";

import "@/_utils/theme.css";
import { PALETTE_HEX } from "@/_utils/constants";
import "./chart.css";

type PieChartDataset = {
    legend: string;
    value: number;
}[];

type ProcessedPieChartDataset = {
    x: string;
    y: number;
    color: string;
}[];

type BarChartDataset = {
    legend: string;
    y: { value: number; group: string }[];
}[];

interface BarSelection {
    legend: string;
    group: string;
    value: number;
    color: string;
}

interface PieSelection {
    legend: string;
    value: number;
    color: string;
}

function comparePieDatasets(
    a: { legend: string; value: number },
    b: { legend: string; value: number },
) {
    if (a.value < b.value) {
        return 1;
    } else if (a.value > b.value) {
        return -1;
    } else {
        return 0;
    }
}

function chooseColor(colors: string[], pickedColors: string[]) {
    const index =
        pickedColors.length < colors.length
            ? pickedColors.length
            : Math.floor(Math.random() * colors.length);
    pickedColors.push(colors[index]);
    return {
        chosenColor: colors[index],
        updatedPickedColors: pickedColors,
    };
}

function formatChartValue(value: number) {
    return new Intl.NumberFormat("fr-FR").format(value);
}

export function BarChart({
    className = "",
    id = "",
    style = {},
    chartId,
    dataset,
}: {
    className?: string;
    id?: string;
    style?: React.CSSProperties;
    chartId: string;
    dataset: BarChartDataset;
}) {
    const [displayData, setDisplayData] = useState<boolean>(false);
    const [selectedBar, setSelectedBar] = useState<BarSelection | null>(null);

    useEffect(() => {
        setDisplayData(false);
        setSelectedBar(null);
        const timeout = window.setTimeout(() => {
            setDisplayData(true);
        }, 10);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [dataset]);

    if (dataset.length < 1) {
        return (
            <div className={`chart-no-data ${className}`} style={style} id={id}>
                Aucune donnee.
            </div>
        );
    }

    let pickedColors: string[] = [];
    const groups: { [key: string]: string } = {};
    dataset.forEach((data) => {
        data.y.forEach((bar) => {
            if (!Object.keys(groups).includes(bar.group)) {
                const colorResult = chooseColor(PALETTE_HEX, pickedColors);
                pickedColors = colorResult.updatedPickedColors;
                groups[bar.group] = colorResult.chosenColor;
            }
        });
    });

    let maxY = 0;
    let hasAnyValue = false;
    const processedDataset: {
        legend: string;
        y: { value: number; color: string; group: string }[];
    }[] = dataset.map((data) => ({
        legend: data.legend,
        y: data.y.map((bar) => {
            if (bar.value > maxY) {
                maxY = bar.value;
            }
            if (bar.value > 0) {
                hasAnyValue = true;
            }
            return {
                value: bar.value,
                color: groups[bar.group],
                group: bar.group,
            };
        }),
    }));

    if (!hasAnyValue) {
        return (
            <div className={`chart-no-data ${className}`} style={style} id={id}>
                Aucune donnee.
            </div>
        );
    }

    const groupCount = Object.keys(groups).length || 1;
    const safeMaxY = maxY > 0 ? maxY : 1;

    return (
        <div className={`chart bar ${className}`} style={style} id={id}>
            <div className="scroll-container">
                <div className="grid">
                    <div className="lines">
                        <div className="line" />
                        <div className="line" />
                        <div className="line" />
                    </div>
                    <div className="placeholder">y</div>
                </div>
                <div className="container">
                    <div className="y-axis">
                        <div className="labels">
                            <div>{formatChartValue(maxY)}</div>
                            <div>0</div>
                        </div>
                        <div className="placeholder">y</div>
                    </div>
                    {processedDataset.map((data) => (
                        <div key={data.legend} className="group-container">
                            <div className="shapes">
                                {data.y.map((group) => {
                                    const isActive =
                                        selectedBar?.legend === data.legend &&
                                        selectedBar?.group === group.group &&
                                        selectedBar?.value === group.value;

                                    return (
                                        <button
                                            key={`${chartId}-${data.legend}-${group.group}`}
                                            type="button"
                                            className={`shape-button ${
                                                isActive ? "active" : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedBar({
                                                    legend: data.legend,
                                                    group: group.group,
                                                    value: group.value,
                                                    color: group.color,
                                                })
                                            }
                                            title={`${group.group} - ${data.legend}: ${formatChartValue(group.value)}`}
                                        >
                                            <span
                                                className="shape"
                                                style={{
                                                    backgroundColor: group.color,
                                                    width:
                                                        (100 / groupCount)
                                                            .toString() + "%",
                                                    height: displayData
                                                        ? (
                                                              (100 *
                                                                  group.value) /
                                                              safeMaxY
                                                          ).toString() + "%"
                                                        : "0px",
                                                }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="x-axis">{data.legend}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="legend">
                {Object.keys(groups).map((groupName, index) => {
                    return (
                        <div className="item" key={`legend-${chartId}-${index}`}>
                            <div
                                className="color"
                                style={{
                                    backgroundColor: groups[groupName],
                                }}
                            ></div>
                            <div className="name">{groupName}</div>
                        </div>
                    );
                })}
            </div>
            {selectedBar && (
                <div className="chart-selection">
                    <div className="selection-chip">
                        <span
                            className="selection-color"
                            style={{ backgroundColor: selectedBar.color }}
                        />
                        <span className="selection-group">
                            {selectedBar.group}
                        </span>
                    </div>
                    <div className="selection-copy">
                        <strong>{selectedBar.legend}</strong>
                        <span>{formatChartValue(selectedBar.value)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export function PieChart({
    className = "",
    id = "",
    chartId,
    dataset,
    sortDataset = "none",
}: {
    className?: string;
    id?: string;
    chartId: string;
    dataset: PieChartDataset;
    sortDataset?: "asc" | "desc" | "none";
}) {
    const [selectedSlice, setSelectedSlice] = useState<PieSelection | null>(
        null,
    );

    useEffect(() => {
        setSelectedSlice(null);
    }, [dataset]);

    const sortedDataset = [...dataset];
    if (sortDataset === "asc") {
        sortedDataset.sort(comparePieDatasets);
    }

    const hasAnyValue = sortedDataset.some((entry) => entry.value > 0);
    if (!hasAnyValue) {
        return (
            <div className={`chart-no-data ${className}`} id={id}>
                Aucune donnee.
            </div>
        );
    }

    const valuesSum = sortedDataset.reduce((a, b) => {
        return a + b.value;
    }, 0);
    const processedDataset: ProcessedPieChartDataset = [];
    let pickedColors: string[] = [];
    sortedDataset.forEach((data) => {
        const colorResult = chooseColor(PALETTE_HEX, pickedColors);
        pickedColors = colorResult.updatedPickedColors;
        processedDataset.push({
            x: data.legend,
            y: data.value,
            color: colorResult.chosenColor,
        });
    });

    return (
        <div className={`chart pie ${className}`} id={id}>
            <div className="pie-visual">
                <div style={{ width: "100%", maxWidth: 220 }}>
                    <VictoryPie
                        animate={{ duration: 1000 }}
                        radius={200}
                        events={[
                            {
                                target: "data",
                                eventHandlers: {
                                    onClick: (_, props) => {
                                        const slice =
                                            processedDataset[props.index];
                                        if (slice) {
                                            setSelectedSlice({
                                                legend: slice.x,
                                                value: slice.y,
                                                color: slice.color,
                                            });
                                        }
                                        return [];
                                    },
                                },
                            },
                        ]}
                        style={{
                            labels: { display: "none" },
                            data: {
                                fill: ({ index }) =>
                                    processedDataset[index as number].color,
                                stroke: ({ index }) =>
                                    selectedSlice?.legend ===
                                    processedDataset[index as number].x
                                        ? "var(--on-surface-color)"
                                        : "transparent",
                                strokeWidth: ({ index }) =>
                                    selectedSlice?.legend ===
                                    processedDataset[index as number].x
                                        ? 2
                                        : 0,
                                cursor: "pointer",
                            },
                        }}
                        data={processedDataset.map((item) => ({
                            x: item.x,
                            y: item.y,
                        }))}
                    />
                </div>
            </div>
            <div className="legend">
                {processedDataset.map((data, index) => {
                    const isActive = selectedSlice?.legend === data.x;

                    return (
                        <button
                            type="button"
                            className={`item legend-button ${
                                isActive ? "active" : ""
                            }`}
                            key={`${chartId}-${index}`}
                            onClick={() =>
                                setSelectedSlice({
                                    legend: data.x,
                                    value: data.y,
                                    color: data.color,
                                })
                            }
                            title={`${data.x}: ${formatChartValue(data.y)}`}
                        >
                            <div
                                className="color"
                                style={{ backgroundColor: data.color }}
                            ></div>
                            <div className="name">
                                {`${data.x} (${Math.round(
                                    (100 * data.y) / valuesSum,
                                )}%)`}
                            </div>
                        </button>
                    );
                })}
            </div>
            {selectedSlice && (
                <div className="chart-selection">
                    <div className="selection-chip">
                        <span
                            className="selection-color"
                            style={{ backgroundColor: selectedSlice.color }}
                        />
                        <span className="selection-group">
                            {selectedSlice.legend}
                        </span>
                    </div>
                    <div className="selection-copy">
                        <strong>Valeur exacte</strong>
                        <span>{formatChartValue(selectedSlice.value)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
