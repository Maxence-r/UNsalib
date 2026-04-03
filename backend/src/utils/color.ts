import chroma from "chroma-js";

const palette = {
    teal1: "#1abc9c",
    teal2: "#16a085",
    green1: "#2ecc71",
    green2: "#27ae60",
    blue1: "#3498db",
    blue2: "#2980b9",
    purple1: "#9b59b6",
    purple2: "#8e44ad",
    black1: "#34495e",
    black2: "2c3e50",
    yellow1: "#f1c40f",
    yellow2: "#f39c12",
    orange1: "#e67e22",
    orange2: "#d35400",
    red1: "#e74c3c",
    red2: "#c0392b",
    lightgrey1: "#bdc3c7",
    lightgrey2: "#95a5a6",
    darkgrey1: "#9c9c9c",
    darkgrey2: "#7f8c8d",
};

function findClosestPaletteColorId(hexColor: string): keyof typeof palette {
    let closestColorId: keyof typeof palette = "lightgrey2";
    let minDistance = Infinity;

    Object.keys(palette).forEach((cId) => {
        const distance = chroma.deltaE(
            chroma(hexColor),
            chroma(palette[cId as keyof typeof palette]),
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColorId = cId as keyof typeof palette;
        }
    });

    return closestColorId;
}

function isLightColor(hexColor: string): boolean {
    const brightness = chroma(hexColor).luminance();

    // Values range from 0 to 1
    // Anything greater than 0.5 should be bright enough for dark text
    return brightness >= 0.5;
}

function blendColors(hexColor1: string, hexColor2: string, amount: number): string {
    return chroma(hexColor1).mix(hexColor2, amount).hex();
}

export {
    findClosestPaletteColorId,
    isLightColor,
    blendColors,
    palette,
};
