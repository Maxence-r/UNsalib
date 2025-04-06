import "@/_utils/theme.css";
import { PALETTE_HEX } from "@/_utils/constants";
import "./chart.css";

type PieChartDataset = {
    legend: string,
    value: number
}[];

type ProcessedPieChartDataset = {
    legend: string,
    percentValue: number,
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

    const processedDataset: ProcessedPieChartDataset = [];
    const valuesSum = sortedDataset.reduce((a, b) => {
        return a + b.value;
    }, 0);
    let conicGradient = "conic-gradient(";
    let radius = 0;
    let pickedColors: string[] = [];
    let valueRadius, color;
    sortedDataset.forEach(data => {
        valueRadius = (360 * data.value / valuesSum);
        const colorResult = chooseColor(PALETTE_HEX, pickedColors);
        color = colorResult.chosenColor;
        pickedColors = colorResult.updatedPickedColors;
        conicGradient += `${color} ${radius}deg ${radius + valueRadius}deg, `;
        radius += valueRadius;
        processedDataset.push({
            legend: data.legend,
            percentValue: Math.round(100 * data.value / valuesSum),
            color: color
        });
    });
    conicGradient = conicGradient.slice(0, conicGradient.length - 2) + ")";

    return (
        <div className={`pie-chart ${className}`} id={id}>
            <div className="shape" style={{ background: processedDataset.length > 0 ? conicGradient : "var(--neutral-color)" }} />
            <div className="legend">
                {
                    processedDataset.length > 0 ?
                        processedDataset.map((data, index) => {
                            return (
                                <div className="legend-item" key={`${chartId} ${index}`}>
                                    <div className="legend-color" style={{ backgroundColor: data.color }}></div>
                                    <div className="legend-name">
                                        {`${data.legend} (${data.percentValue}%)`}
                                    </div>
                                </div>
                            );
                        }) :
                        <>Aucune donnée</>
                }
            </div>
        </div>
    );
}

PieChart.defaultProps = { className: "", id: "", sortDataset: "none" };