"use client";

import { VictoryPie } from "victory";

import "@/_utils/theme.css";
import { PALETTE_HEX } from "@/_utils/constants";
import "./chart.css";
import { useState } from "react";

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
            ? pickedColors.length + 1
            : Math.floor(Math.random() * colors.length);
    pickedColors.push(colors[index]);
    return {
        chosenColor: colors[index],
        updatedPickedColors: pickedColors,
    };
}

export function BarChart({
    className,
    id,
    style,
    chartId,
    dataset,
}: {
    className: string;
    id: string;
    style: React.CSSProperties;
    chartId: string;
    dataset: BarChartDataset;
}) {
    // dataset:  = [
    //     {
    //         legend: "day1",
    //         y: [
    //             { value: 4, group: "test1" },
    //             { value: 8, group: "test2" },
    //         ],
    //     },
    //     {
    //         legend: "day2",
    //         y: [
    //             { value: 4, group: "test1" },
    //             { value: 8, group: "test2" },
    //         ],
    //     },
    //     {
    //         legend: "day3",
    //         y: [
    //             { value: 4, group: "test1" },
    //             { value: 8, group: "test2" },
    //         ],
    //     },
    //     {
    //         legend: "day4",
    //         y: [
    //             { value: 4, group: "test1" },
    //             { value: 8, group: "test2" },
    //         ],
    //     },
    // ];

    const [displayData, setDisplayData] = useState<boolean>(false);

    if (dataset.length < 1) {
        return (
            <div className={`chart-no-data ${className}`} style={style} id={id}>
                Aucune donnée.
            </div>
        );
    }

    setTimeout(() => setDisplayData(true), 0.1);

    // Get all groups and give them a color
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
    const processedDataset: {
        legend: string;
        y: { value: number; color: string }[];
    }[] = dataset.map((data) => ({
        legend: data.legend,
        y: data.y.map((bar) => {
            if (bar.value > maxY) maxY = bar.value;
            return {
                value: bar.value,
                color: groups[bar.group],
            };
        }),
    }));

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
                            <div>{maxY}</div>
                            <div>0</div>
                        </div>
                        <div className="placeholder">y</div>
                    </div>
                    {processedDataset.map((data) => (
                        <div key={data.legend} className="group-container">
                            <div className="shapes">
                                {data.y.map((group) => (
                                    <div
                                        key={group.color}
                                        className="shape"
                                        style={{
                                            backgroundColor: group.color,
                                            width:
                                                100 /
                                                    Object.keys(groups).length +
                                                "%",
                                            height: displayData
                                                ? (
                                                      (100 * group.value) /
                                                      maxY
                                                  ).toString() + "%"
                                                : "0px",
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="x-axis">{data.legend}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="legend">
                {Object.keys(groups).map((groupName, index) => {
                    return (
                        <div
                            className="item"
                            key={`legend-${chartId}-${index}`}
                        >
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
        </div>
    );
}

// export function BarChart({
//     className,
//     id,
//     chartId,
//     dataset,
//     sortDataset,
// }: {
//     className: string;
//     id: string;
//     chartId: string;
//     dataset: PieChartDataset;
//     sortDataset: "asc" | "desc" | "none";
// }) {
//     const sortedDataset = dataset;
//     if (sortDataset === "asc") {
//         sortedDataset.sort(comparePieDatasets);
//     }

//     const valuesSum = sortedDataset.reduce((a, b) => {
//         return a + b.value;
//     }, 0);
//     const processedDataset: ProcessedPieChartDataset = [];
//     let pickedColors: string[] = [];
//     let color;
//     sortedDataset.forEach((data) => {
//         const colorResult = chooseColor(PALETTE_HEX, pickedColors);
//         color = colorResult.chosenColor;
//         pickedColors = colorResult.updatedPickedColors;
//         processedDataset.push({
//             x: data.legend,
//             y: data.value,
//             color: color,
//         });
//     });

//     return (
//         <div className={`bar-chart ${className}`} id={id}>
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     width: "100%",
//                 }}
//             >
//                 <div style={{ maxHeight: 200, width: "100%" }}>
//                     <VictoryChart
//                         domain={{ y: [0.5, 5.5] }}
//                         domainPadding={{ x: 40 }}
//                         animate={{ duration: 1000 }}
//                     >
//                         <VictoryGroup
//                             offset={20}
//                             style={{ data: { width: 15 } }}
//                         >
//                             <VictoryBar
//                                 data={[
//                                     { x: "2023 Q1", y: 1 },
//                                     { x: "2023 Q2", y: 2 },
//                                     { x: "2023 Q3", y: 3 },
//                                     { x: "2023 Q4", y: 2 },
//                                     { x: "2023 Q5", y: 1 },
//                                     { x: "2023 Q6", y: 2 },
//                                     { x: "2023 Q7", y: 3 },
//                                     { x: "2023 Q8", y: 2 },
//                                 ]}
//                             />
//                             <VictoryBar
//                                 data={[
//                                     { x: "2023 Q1", y: 2 },
//                                     { x: "2023 Q2", y: 3 },
//                                     { x: "2023 Q3", y: 4 },
//                                     { x: "2023 Q4", y: 5 },
//                                     { x: "2023 Q5", y: 1 },
//                                     { x: "2023 Q6", y: 2 },
//                                     { x: "2023 Q7", y: 3 },
//                                     { x: "2023 Q8", y: 2 },
//                                 ]}
//                             />
//                             <VictoryBar
//                                 data={[
//                                     { x: "2023 Q1", y: 1 },
//                                     { x: "2023 Q2", y: 2 },
//                                     { x: "2023 Q3", y: 3 },
//                                     { x: "2023 Q4", y: 4 },
//                                     { x: "2023 Q5", y: 1 },
//                                     { x: "2023 Q6", y: 2 },
//                                     { x: "2023 Q7", y: 3 },
//                                     { x: "2023 Q8", y: 2 },
//                                 ]}
//                             />
//                         </VictoryGroup>
//                     </VictoryChart>
//                     {/* <VictoryPie
//                         animate={{ duration: 1000 }}
//                         radius={200}
//                         style={{
//                             labels: { display: "none" },
//                             data:
//                                 processedDataset.length > 0
//                                     ? {
//                                           fill: ({ index }) =>
//                                               processedDataset[index as number]
//                                                   .color,
//                                       }
//                                     : {
//                                           fill: "transparent",
//                                       },
//                         }}
//                         data={
//                             processedDataset.length > 0
//                                 ? processedDataset.map((item) => ({
//                                       x: item.x,
//                                       y: item.y,
//                                   }))
//                                 : [{ x: "", y: 100 }]
//                         }
//                     />*/}
//                 </div>
//             </div>
//             <div className="legend">
//                 {processedDataset.length > 0 ? (
//                     processedDataset.map((data, index) => {
//                         return (
//                             <div
//                                 className="legend-item"
//                                 key={`${chartId} ${index}`}
//                             >
//                                 <div
//                                     className="legend-color"
//                                     style={{ backgroundColor: data.color }}
//                                 ></div>
//                                 <div className="legend-name">
//                                     {`${data.x} (${Math.round(
//                                         (100 * data.y) / valuesSum,
//                                     )}%)`}
//                                 </div>
//                             </div>
//                         );
//                     })
//                 ) : (
//                     <>Aucune donnée</>
//                 )}
//             </div>
//         </div>
//     );
// }

export function PieChart({
    className,
    id,
    chartId,
    dataset,
    sortDataset,
}: {
    className: string;
    id: string;
    chartId: string;
    dataset: PieChartDataset;
    sortDataset: "asc" | "desc" | "none";
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
    sortedDataset.forEach((data) => {
        const colorResult = chooseColor(PALETTE_HEX, pickedColors);
        color = colorResult.chosenColor;
        pickedColors = colorResult.updatedPickedColors;
        processedDataset.push({
            x: data.legend,
            y: data.value,
            color: color,
        });
    });

    return (
        <div className={`pie-chart ${className}`} id={id}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <div style={{ maxWidth: 200 }}>
                    <VictoryPie
                        animate={{ duration: 1000 }}
                        radius={200}
                        style={{
                            labels: { display: "none" },
                            data:
                                processedDataset.length > 0
                                    ? {
                                          fill: ({ index }) =>
                                              processedDataset[index as number]
                                                  .color,
                                      }
                                    : {
                                          fill: "transparent",
                                      },
                        }}
                        data={
                            processedDataset.length > 0
                                ? processedDataset.map((item) => ({
                                      x: item.x,
                                      y: item.y,
                                  }))
                                : [{ x: "", y: 100 }]
                        }
                    />
                </div>
            </div>
            <div className="legend">
                {processedDataset.length > 0 ? (
                    processedDataset.map((data, index) => {
                        return (
                            <div
                                className="legend-item"
                                key={`${chartId} ${index}`}
                            >
                                <div
                                    className="legend-color"
                                    style={{ backgroundColor: data.color }}
                                ></div>
                                <div className="legend-name">
                                    {`${data.x} (${Math.round(
                                        (100 * data.y) / valuesSum,
                                    )}%)`}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <>Aucune donnée</>
                )}
            </div>
        </div>
    );
}

PieChart.defaultProps = { className: "", id: "", sortDataset: "none" };
BarChart.defaultProps = { className: "", id: "", style: "none" };
