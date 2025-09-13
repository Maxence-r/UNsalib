import "dotenv/config";

import fixDb from "./fixDB.js";
import getGroups from "./getGroups.js";
import { getCourses, processBatchGroups, processGroup } from "./getCourses.js";

async function launch() {
    // // If 'FORCER_RECUP_GPES' is activated, fetch all groups immediately
    // console.log();
    // if (process.env.FORCER_RECUP_GPES === 'true') {
    //     console.log('Récupération des groupes ACTIVÉE - Démarrage du processus...');
    //     await getGroups();
    // } else {
    //     console.log('Récupération des groupes DÉSACTIVÉE');
    // }
    // // If 'FORCER_TRAITEMENT_GPES' is activated, process all groups immediately
    // console.log();
    // if (process.env.FORCER_TRAITEMENT_GPES === 'true' || process.env.CORRIGER_GPES_INCORRECTS === 'true') {
    //     console.log('Traitement de tous les groupes ACTIVÉ - Démarrage du processus...');
    //     await processBatchGroups();
    // } else {
    //     console.log('Traitement de tous les groupes DÉSACTIVÉ');
    // }
    // // If 'FORCER_TRAITEMENT_GPES' is activated, process all groups immediately
    // console.log();
    // if (process.env.CORRIGER_GPES_INCORRECTS === 'true') {
    //     console.log('Correction des groupes incorrects ACTIVÉE - Démarrage du processus...');
    //     await fixDb();
    // } else {
    //     console.log('Correction des groupes incorrects DÉSACTIVÉE');
    // }
    // // await processGroup('L1')
    // console.log();
    // getCourses();
}

export default launch;
