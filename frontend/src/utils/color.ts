interface RgbColor {
    r: number;
    g: number;
    b: number;
}

// Adapted from https://stackoverflow.com/a
// Posted by Alex Marchant, modified by community
// Retrieved 2025-12-08, License - CC BY-SA 3.0
function isLightColor({ r, g, b }: RgbColor): boolean {
    let brightness = r * 299 + g * 587 + b * 114;
    brightness = brightness / 255000;

    // values range from 0 to 1
    // anything greater than 0.5 should be bright enough for dark text
    if (brightness >= 0.5) {
        return true;
    }
    return false;
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

export { isLightColor, hexToRgb };
