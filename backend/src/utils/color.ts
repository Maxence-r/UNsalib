interface HslColor {
    h: number;
    s: number;
    l: number;
}

interface RgbColor {
    r: number;
    g: number;
    b: number;
}

// CONSTANTS
const HSL_PALETTE = [
    { h: 168.8, s: 76.1, l: 50.0 }, // #1abc9c
    { h: 145.0, s: 63.7, l: 47.1 }, // #2ecc71
    { h: 204.0, s: 70.6, l: 53.9 }, // #3498db
    { h: 282.6, s: 38.2, l: 50.2 }, // #9b59b6
    { h: 210.0, s: 29.0, l: 39.2 }, // #34495e
    { h: 168.8, s: 76.1, l: 43.9 }, // #16a085
    { h: 145.0, s: 63.7, l: 39.0 }, // #27ae60
    { h: 204.0, s: 70.6, l: 44.1 }, // #2980b9
    { h: 282.6, s: 38.2, l: 39.8 }, // #8e44ad
    { h: 210.0, s: 29.0, l: 31.4 }, // #2c3e50
    { h: 48.0, s: 89.4, l: 56.7 }, // #f1c40f
    { h: 28.6, s: 80.3, l: 51.8 }, // #e67e22
    { h: 5.7, s: 79.5, l: 56.5 }, // #e74c3c
    { h: 0.0, s: 0.0, l: 61.0 }, // #ecf0f1
    { h: 0.0, s: 0.0, l: 60.0 }, // #95a5a6
    { h: 36.7, s: 85.9, l: 49.4 }, // #f39c12
    { h: 24.0, s: 84.6, l: 41.4 }, // #d35400
    { h: 2.6, s: 79.7, l: 41.2 }, // #c0392b
    { h: 0.0, s: 0.0, l: 74.1 }, // #bdc3c7
    { h: 0.0, s: 0.0, l: 49.0 }, // #7f8c8d
];

const HEX_PALETTE = [
    "#1abc9c",
    "#2ecc71",
    "#3498db",
    "#9b59b6",
    "#34495e",
    "#16a085",
    "#27ae60",
    "#2980b9",
    "#8e44ad",
    "#2c3e50",
    "#f1c40f",
    "#e67e22",
    "#e74c3c",
    "#9c9c9c",
    "#95a5a6",
    "#f39c12",
    "#d35400",
    "#c0392b",
    "#bdc3c7",
    "#7f8c8d",
];

// Finds the nearest color in the palette provided
function closestPaletteColor(hexColor: string): string {
    const hslColor = rgbToHsl(hexToRgb(hexColor));

    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < HSL_PALETTE.length; i++) {
        const distance = colorsDistance(hslColor, HSL_PALETTE[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
        }
    }

    return HEX_PALETTE[closestIndex];
}

// Calculates the distance between 2 HSL colors
function colorsDistance(c1: HslColor, c2: HslColor): number {
    const dh =
        Math.min(Math.abs(c1.h - c2.h), 360 - Math.abs(c1.h - c2.h)) / 180;
    const ds = (c1.s - c2.s) / 100;
    const dl = (c1.l - c2.l) / 100;
    return Math.sqrt(dh * dh + ds * ds + dl * dl);
}

// Converts a color in hexadecimal format to RGB
function hexToRgb(hex: string): RgbColor {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

// Converts a color in RGB format to HSL
function rgbToHsl(c: RgbColor): HslColor {
    c.r /= 255;
    c.g /= 255;
    c.b /= 255;
    const max = Math.max(c.r, c.g, c.b),
        min = Math.min(c.r, c.g, c.b);
    let h = 0,
        s = 0;
    const l = (max + min) / 2;
    const d = max - min;

    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        switch (max) {
            case c.r:
                h = (c.g - c.b) / d + (c.g < c.b ? 6 : 0);
                break;
            case c.g:
                h = (c.b - c.r) / d + 2;
                break;
            case c.b:
                h = (c.r - c.g) / d + 4;
                break;
        }
        h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
}

export { closestPaletteColor };
