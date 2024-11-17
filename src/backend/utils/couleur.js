// Palette tirée de https://flatuicolors.com/palette/defo
// Extraction automatique depuis la console :
// colors = []
// document.querySelectorAll(".color").forEach((color) => {
//     color = color.style.background.split(",");
//     color = { r: color[0].replace("rgb(", ""), g: color[1].trim(), b: color[2].replace(")", "").trim() };
//     colors.push("#" + (1 << 24 | color.r << 16 | color.g << 8 | color.b).toString(16).slice(1));
// });
// console.log(colors);
const PALETTE = [
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
    "#ecf0f1",
    "#95a5a6",
    "#f39c12",
    "#d35400",
    "#c0392b",
    "#bdc3c7",
    "#7f8c8d"
]
const PALETTE_HSL = []
PALETTE.forEach(couleur => {
    PALETTE_HSL.push(convertirRgbEnHsl(convertirHexEnRgb(couleur)));
});

function couleurPaletteProche(couleur) {
    couleur = convertirRgbEnHsl(convertirHexEnRgb(couleur));

    // Fonction pour calculer la distance euclidienne entre deux couleurs HSL
    function distanceCouleurs(couleur1, couleur2) {
        const dh = couleur1.h - couleur2.h; // Différence de teinte
        const ds = couleur1.s - couleur2.s; // Différence de saturation
        const dl = couleur1.l - couleur2.l; // Différence de luminosité
        return Math.sqrt(dh * dh + ds * ds + dl * dl);
    }

    // Recherche de la couleur la plus proche
    let indiceCouleurProche = 0;
    let distanceMin = distanceCouleurs(couleur, PALETTE_HSL[indiceCouleurProche]);

    for (let i = 1; i < PALETTE_HSL.length; i++) {
        const distanceActuelle = distanceCouleurs(couleur, PALETTE_HSL[i]);
        if (distanceActuelle < distanceMin) {
            distanceMin = distanceActuelle;
            indiceCouleurProche = i;
        }
    }

    return PALETTE[indiceCouleurProche];
}

function convertirRgbEnHsl({ r, g, b }) {
    // Convertir les valeurs RGB de 0-255 à 0-1
    r /= 255;
    g /= 255;
    b /= 255;

    // Trouver les valeurs max et min
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Calculer la luminance (L)
    let l = (max + min) / 2;

    // Calculer la saturation (S)
    let s = 0;
    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));
    }

    // Calculer la teinte (H)
    let h = 0;
    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else if (max === b) {
            h = (r - g) / delta + 4;
        }
        h *= 60; // Convertir en degrés
        if (h < 0) h += 360; // S'assurer que H est positif
    }

    // Convertir S et L en pourcentage (0-100)
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h: +h.toFixed(1), s, l };
}

function convertirHexEnRgb(hex) {
    // Fonction tirée de https://stackoverflow.com/a/5624139
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export {
    couleurPaletteProche,
    convertirHexEnRgb,
    convertirRgbEnHsl
};