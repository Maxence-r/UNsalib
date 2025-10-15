"use client";

import { VictoryPie, VictoryLine, VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryTheme } from "victory";

import "@/_utils/theme.css";
import { PALETTE_HEX } from "@/_utils/constants";
import "./chart.css";

type PieChartDataset = {
    legend: string,
    value: number
}[];

type ProcessedPieChartDataset = {
    x: string,
    y: number,
    color: string
}[];

function comparePieDatasets(a: { legend: string, value: number }, b: { legend: string, value: number }) {
    if (a.value < b.value) {
        return 1;
    } else if (a.value > b.value) {
        return -1;
    } else {
        return 0;
    }
}

function chooseColor(colors: string[], pickedColors: string[]) {
    const index = pickedColors.length < colors.length ? pickedColors.length + 1 : Math.floor(Math.random() * colors.length);
    pickedColors.push(colors[index]);
    return {
        chosenColor: colors[index],
        updatedPickedColors: pickedColors
    };
}

export function PieChart({
    className,
    id,
    chartId,
    dataset,
    sortDataset
}: {
    className: string,
    id: string,
    chartId: string,
    dataset: PieChartDataset,
    sortDataset: "asc" | "desc" | "none"
}) {
    const sortedDataset = dataset;
    if (sortDataset === "asc") {
        sortedDataset.sort(comparePieDatasets);
    }

    const valuesSum = sortedDataset.reduce((a, b) => {
        return a + b.value;
    }, 0);
    const processedDataset: ProcessedPieChartDataset = [];
    let pickedColors: string[] = [];
    let color;
    sortedDataset.forEach(data => {
        const colorResult = chooseColor(PALETTE_HEX, pickedColors);
        color = colorResult.chosenColor;
        pickedColors = colorResult.updatedPickedColors;
        processedDataset.push({
            x: data.legend,
            y: data.value,
            color: color
        });
    });

    return (
        <div className={`pie-chart ${className}`} id={id}>
            <div style={{
                display: "flex",
                justifyContent: "center",
                width: "100%"
            }}>
                <div style={{ maxWidth: 200 }}>
                    <VictoryPie
                        animate={{ duration: 1000 }}
                        radius={200}
                        style={{
                            labels: { display: "none" },
                            data: processedDataset.length > 0 ? {
                                fill: ({ index }) => processedDataset[index as number].color
                            } : {
                                fill: "transparent"
                            }
                        }}
                        data={processedDataset.length > 0 ?
                            processedDataset.map(item => ({ x: item.x, y: item.y }))
                            : [{ x: "", y: 100 }]
                        }
                    />
                </div>
            </div>
            <div className="legend">
                {
                    processedDataset.length > 0 ?
                        processedDataset.map((data, index) => {
                            return (
                                <div className="legend-item" key={`${chartId} ${index}`}>
                                    <div className="legend-color" style={{ backgroundColor: data.color }}></div>
                                    <div className="legend-name">
                                        {`${data.x} (${Math.round(100 * data.y / valuesSum)}%)`}
                                    </div>
                                </div>
                            );
                        }) : <>Aucune donnée</>
                }
            </div>
        </div>
    );
}

PieChart.defaultProps = { className: "", id: "", sortDataset: "none" };

type LineChartDataset = {
    date: string,
    value: number
}[];

export function LineChart({
    className,
    id,
    dataset,
    title,
    xLabel,
    yLabel
}: {
    className?: string,
    id?: string,
    dataset: LineChartDataset,
    title?: string,
    xLabel?: string,
    yLabel?: string
}) {
    const processedDataset = dataset.map(item => ({
        x: new Date(item.date),
        y: item.value
    }));

    return (
        <div className={`line-chart ${className}`} id={id}>
            {title && <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{title}</h3>}
            <VictoryChart
                theme={VictoryTheme.material}
                containerComponent={
                    <VictoryVoronoiContainer
                        labels={({ datum }) => `${datum.x.toLocaleDateString()}\n${datum.y}`}
                    />
                }
                height={300}
                padding={{ top: 20, bottom: 60, left: 60, right: 20 }}
            >
                <VictoryAxis
                    label={xLabel}
                    style={{
                        axisLabel: { padding: 35 },
                        tickLabels: { angle: -45, textAnchor: 'end', fontSize: 10 }
                    }}
                    tickFormat={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    label={yLabel}
                    style={{
                        axisLabel: { padding: 40 }
                    }}
                />
                <VictoryLine
                    data={processedDataset}
                    style={{
                        data: { stroke: PALETTE_HEX[0], strokeWidth: 3 }
                    }}
                    animate={{
                        duration: 1000,
                        onLoad: { duration: 500 }
                    }}
                />
            </VictoryChart>
        </div>
    );
}

LineChart.defaultProps = { className: "", id: "", title: "", xLabel: "", yLabel: "" };

type BarChartDataset = {
    label: string,
    value: number
}[];

export function BarChart({
    className,
    id,
    dataset,
    title,
    xLabel,
    yLabel,
    horizontal
}: {
    className?: string,
    id?: string,
    dataset: BarChartDataset,
    title?: string,
    xLabel?: string,
    yLabel?: string,
    horizontal?: boolean
}) {
    const processedDataset = dataset.map((item, index) => ({
        x: item.label,
        y: item.value,
        fill: PALETTE_HEX[index % PALETTE_HEX.length]
    }));

    return (
        <div className={`bar-chart ${className}`} id={id}>
            {title && <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{title}</h3>}
            <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: 30 }}
                height={300}
                padding={{ top: 20, bottom: 60, left: 80, right: 20 }}
            >
                <VictoryAxis
                    label={xLabel}
                    style={{
                        axisLabel: { padding: 35 },
                        tickLabels: { angle: horizontal ? 0 : -45, textAnchor: 'end', fontSize: 10 }
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    label={yLabel}
                    style={{
                        axisLabel: { padding: 60 }
                    }}
                />
                <VictoryBar
                    data={processedDataset}
                    style={{
                        data: {
                            fill: ({ datum }) => datum.fill
                        }
                    }}
                    labels={({ datum }) => datum.y}
                    labelComponent={<VictoryTooltip />}
                    animate={{
                        duration: 1000,
                        onLoad: { duration: 500 }
                    }}
                    horizontal={horizontal}
                />
            </VictoryChart>
        </div>
    );
}

BarChart.defaultProps = { className: "", id: "", title: "", xLabel: "", yLabel: "", horizontal: false };