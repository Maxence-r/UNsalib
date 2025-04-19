"use client";

import { VictoryPie, VictoryContainer, VictoryTheme } from "victory";
import { useEffect, useState } from "react";

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

// export function PieChart({
//     className,
//     id,
//     chartId,
//     dataset,
//     sortDataset
// }: {
//     className: string,
//     id: string,
//     chartId: string,
//     dataset: PieChartDataset,
//     sortDataset: "asc" | "desc" | "none"
// }) {
//     const sortedDataset = dataset;
//     if (sortDataset === "asc") {
//         sortedDataset.sort(comparePieDatasets);
//     }

//     const processedDataset: ProcessedPieChartDataset = [];
//     const valuesSum = sortedDataset.reduce((a, b) => {
//         return a + b.value;
//     }, 0);
//     let conicGradient = "conic-gradient(";
//     let radius = 0;
//     let pickedColors: string[] = [];
//     let valueRadius, color;
//     sortedDataset.forEach(data => {
//         valueRadius = (360 * data.value / valuesSum);
//         const colorResult = chooseColor(PALETTE_HEX, pickedColors);
//         color = colorResult.chosenColor;
//         pickedColors = colorResult.updatedPickedColors;
//         conicGradient += `${color} ${radius}deg ${radius + valueRadius}deg, `;
//         radius += valueRadius;
//         processedDataset.push({
//             legend: data.legend,
//             percentValue: Math.round(100 * data.value / valuesSum),
//             color: color
//         });
//     });
//     conicGradient = conicGradient.slice(0, conicGradient.length - 2) + ")";

//     return (
//         <div className={`pie-chart ${className}`} id={id}>
//             <div className="shape" style={{ background: processedDataset.length > 0 ? conicGradient : "var(--neutral-color)" }} />
//             <div className="legend">
//                 {
//                     processedDataset.length > 0 ?
//                         processedDataset.map((data, index) => {
//                             return (
//                                 <div className="legend-item" key={`${chartId} ${index}`}>
//                                     <div className="legend-color" style={{ backgroundColor: data.color }}></div>
//                                     <div className="legend-name">
//                                         {`${data.legend} (${data.percentValue}%)`}
//                                     </div>
//                                 </div>
//                             );
//                         }) :
//                         <>Aucune donnée</>
//                 }
//             </div>
//         </div>
//     );
// }

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

    const [data, setData] = useState(getData());

    useEffect(() => {
        const setStateInterval =
            window.setInterval(() => {
                setData(getData());
            }, 4000);

        return () => {
            window.clearInterval(
                setStateInterval,
            );
        };
    }, []);

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

function getData() {
    const rand = () =>
        Math.max(
            Math.floor(Math.random() * 10000),
            1000,
        );
    return [
        { x: "5-13", y: rand() },
        { x: "14-17", y: rand() },
        { x: "18-24", y: rand() },
        { x: "25-44", y: rand() },
        { x: "45-64", y: rand() },
        { x: "≥65", y: rand() },
    ];
}


PieChart.defaultProps = { className: "", id: "", sortDataset: "none" };