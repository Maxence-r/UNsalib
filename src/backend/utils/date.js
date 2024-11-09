// FONCTIONS DE TRAITEMENTS
function formatDateValide(date) {
    const regex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})$/;
    return regex.test(date);
}

function obtenirDatesSemaine(numero) {
    console.log("entering", numero);
    // Crée un objet Date pour le début de l'année
    const startDate = new Date(new Date().getFullYear(), 0, 1);

    // Calcule le jour (0: dimanche, 1: lundi, etc.) du 1er janvier de l'année
    const startDay = startDate.getDay() || 7;

    // Calcule le décalage pour arriver au lundi de la première semaine de l'année
    const daysOffset = (numero - 1) * 7 - (startDay - 1);

    // Calcule la date de début de la semaine
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + daysOffset);

    // Calcule la date de fin de la semaine (dimanche)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Formate les dates au format ISO (YYYY-MM-DD)
    const mondayISO = monday.toISOString().split("T")[0];
    const sundayISO = sunday.toISOString().split("T")[0];

    // Retourne les dates de début et de fin de la semaine
    return { debut: mondayISO, fin: sundayISO };
}

function getWeeksInYear() {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    const diffTime = currentDate - startOfYear;

    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const weeks = Math.ceil(diffDays / 7);
    console.log(weeks);
    return weeks;
}

export { formatDateValide, obtenirDatesSemaine, getWeeksInYear };
