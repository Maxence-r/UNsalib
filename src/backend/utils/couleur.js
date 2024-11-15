function pastelliser(color) {
    const saturationFactor = 0.9; // Réduction de la saturation de 10%
    const mixWithWhite = 0.5; // Mélange à 50% avec du blanc
    // Application de la saturation et du mélange
    const r = Math.floor((color.r * saturationFactor + 255 * (1 - saturationFactor)) * mixWithWhite);
    const g = Math.floor((color.g * saturationFactor + 255 * (1 - saturationFactor)) * mixWithWhite);
    const b = Math.floor((color.b * saturationFactor + 255 * (1 - saturationFactor)) * mixWithWhite);
    return { r, g, b };
}
function convertirHexEnRgb(hex) {
    // Fonction tirée de https://stackoverflow.com/a/5624139
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
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
    pastelliser,
    convertirHexEnRgb,
    convertirRgbEnHex
};