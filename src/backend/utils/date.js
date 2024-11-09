// FONCTIONS DE TRAITEMENT

function formatDateValide(date) {
    const regex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})$/;
    return regex.test(date);
}

function obtenirDatesSemaine(numero) {
    const dateDebut = new Date(new Date().getFullYear(), 0, 2); // date de début de l'année (1er janvier)
    const joursDecalage = (numero - 1) * 7 + 1; // décalage entre le 1er janvier et le lundi de la semaine demandée

    // Calcul de la date du lundi de la semaine demandée
    const lundi = new Date(dateDebut);
    lundi.setDate(dateDebut.getDate() + joursDecalage);
    // Calcul de la date du dimanche de la semaine demandée
    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);
    // Formatage des dates
    const lundiISO = lundi.toISOString().split("T")[0];
    const dimancheISO = dimanche.toISOString().split("T")[0];

    return { debut: lundiISO, fin: dimancheISO };
}

function obtenirNbSemaines() {
    const dateActuelle = new Date();
    const dateDebut = new Date(dateActuelle.getFullYear(), 0, 1); // date de début de l'année (1er janvier)

    // Calcul de la différence entre la date actuelle et le début de l'année
    const differenceDates = dateActuelle - dateDebut;
    const diffDays = differenceDates / (1000 * 60 * 60 * 24);
    // Calcul du nombre de semaines
    const nbSemaines = Math.ceil(diffDays / 7);

    return nbSemaines;
}

function obtenirOverflowMinutes(date) {
    const minutes = date.getMinutes();
    return minutes <= 30 ? minutes : 0 - 60 + minutes;
}

export { formatDateValide, obtenirDatesSemaine, obtenirNbSemaines, obtenirOverflowMinutes };
