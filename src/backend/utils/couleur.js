// Palette tirée de https://flatuicolors.com/palette/defo
const PALETTE = [
  { r: 26, g: 188, b: 156 },
  { r: 46, g: 204, b: 113 },
  { r: 52, g: 152, b: 219 },
  { r: 155, g: 89, b: 182 },
  { r: 52, g: 73, b: 94 },
  { r: 22, g: 160, b: 133 },
  { r: 39, g: 174, b: 96 },
  { r: 41, g: 128, b: 185 },
  { r: 142, g: 68, b: 173 },
  { r: 44, g: 62, b: 80 },
  { r: 241, g: 196, b: 15 },
  { r: 230, g: 126, b: 34 },
  { r: 231, g: 76, b: 60 },
  { r: 236, g: 240, b: 241 },
  { r: 149, g: 165, b: 166 },
  { r: 243, g: 156, b: 18 },
  { r: 211, g: 84, b: 0 },
  { r: 192, g: 57, b: 43 },
  { r: 189, g: 195, b: 199 },
  { r: 127, g: 140, b: 141 }
]

function couleurPaletteProche(couleur) {
  let score = 255 * 3;
  let couleurPaletteProche;
  couleur = convertirHexEnRgb(couleur);
  PALETTE.forEach(couleurPalette => {
    let scoreTemp = Math.abs(couleurPalette.r - couleur.r) + Math.abs(couleurPalette.g - couleur.g) + Math.abs(couleurPalette.b - couleur.b);
    if (scoreTemp < score) {
      score = scoreTemp;
      couleurPaletteProche = couleurPalette;
    }
  });
  return couleurPaletteProche;
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

function convertirRgbEnHex(couleur) {
  // Fonction tirée de https://stackoverflow.com/a/5624139
  return "#" + (1 << 24 | couleur.r << 16 | couleur.g << 8 | couleur.b).toString(16).slice(1);
}

export {
  couleurPaletteProche,
  convertirHexEnRgb,
  convertirRgbEnHex
};