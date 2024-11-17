// FONCTIONS DE TRAITEMENT

function formatDateValide(date) {
    const regex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})$/;
    return regex.test(date);
}

function obtenirDatesSemaine(numero) {
    const annee = new Date().getFullYear();
    const dateJanvierQuatre = new Date(annee, 0, 4);
    const jourSemaine = dateJanvierQuatre.getDay() || 7; // Jour de la semaine (1-7)
    const premierLundi = new Date(dateJanvierQuatre);
    premierLundi.setDate(dateJanvierQuatre.getDate() - (jourSemaine - 1));

    // Calcul du lundi de la semaine demandée
    const lundi = new Date(premierLundi);
    lundi.setDate(premierLundi.getDate() + (numero - 1) * 7);

    // Calcul du dimanche de la semaine demandée
    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);

    // Formatage des dates au format YYYY-MM-DD sans problèmes de fuseau horaire
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const lundiISO = formatDate(lundi);
    const dimancheISO = formatDate(dimanche);

    return { debut: lundiISO, fin: dimancheISO };
}
function obtenirNbSemaines() {
    const dateActuelle = new Date();
    const dateDebut = new Date(dateActuelle.getFullYear(), 0, 1); // Date du début de l'année (1er janvier)

    // Calcul de la différence entre la date actuelle et le début de l'année
    const differenceDates = dateActuelle - dateDebut;
    const diffDays = differenceDates / (1000 * 60 * 60 * 24);

    // Calcul du nombre de semaines
    let nbSemaines = Math.ceil(diffDays / 7);

    // Obtenir le jour actuel (0 pour dimanche, 1 pour lundi, ..., 6 pour samedi)
    const jourActuel = dateActuelle.getDay();

    // Si c'est samedi (6) ou dimanche (0), incrémenter le numéro de la semaine
    if (jourActuel === 6 || jourActuel === 0) {
        nbSemaines += 1;
    }

    return nbSemaines;
}

function obtenirOverflowMinutes(date) {
    const minutes = date.getMinutes();
    return minutes <= 30 ? minutes : 0 - 60 + minutes;
}

export {
    formatDateValide,
    obtenirDatesSemaine,
    obtenirNbSemaines,
    obtenirOverflowMinutes,
};