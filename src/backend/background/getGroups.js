/*
Obtient les groupes depuis le site d'emplois du temps de l'Université 
*/
import  Groupe from "../models/groupe.js";
import { parse } from "node-html-parser";
import { getCourses } from "./getCourses.js";
import 'dotenv/config'

async function getHTML(url) {
    try {
        const response = await fetch(url);
        const html = await response.text(); // conversion de la réponse en texte brut
        return html;
    } catch (error) {
        console.log("Erreur lors de l'obtention de la page ", url, ":", error)
        return -1;
    }
}

async function getGroups() {
    if (process.env.FORCER_RECUP_GPES === "false") {
        console.log("Récupération des groupes DÉSACTIVÉE");
        return getCourses();
    }
    console.log("Récupération des groupes ACTIVÉE - Démarrage du processus...");
    await Groupe.deleteMany({});
    const page = await getHTML("https://edt-v2.univ-nantes.fr/sciences/educational_groups");
    if (page !== -1) { // il n'y a pas d'erreur dans la requête
        const docRoot = parse(page);
        const groupsInputs = docRoot.querySelectorAll("#desktopGroupForm #educational_groups input");
        for (const input of groupsInputs) {
            // obtient l'id de chaque case à cocher qui contient celui de l'emploi du temps
            const group = input.id.replace("desktop-timetable-", "");
            const exists = await Groupe.exists({ identifiant: group });
            if (!exists) {
                const groupeObj = new Groupe({
                    identifiant: group,
                    nom: input.nextElementSibling.textContent.trim()
                });
                await groupeObj.save();
                process.stdout.write(groupsInputs.indexOf(input) + 1 + "/" + groupsInputs.length + " obtenus" + "\r");
            }
        }
            
        getCourses();
    } else {
        console.error("Erreur lors de la récupération des groupes.");
    }
}

export default getGroups;
