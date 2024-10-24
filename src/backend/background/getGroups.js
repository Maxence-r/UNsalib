/*
Obtient les groupes depuis le site d'emplois du temps de l'Université 
*/
import  Groupe from "../models/groupe.js";
import { parse } from "node-html-parser";

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
    const page = await getHTML("https://edt-v2.univ-nantes.fr/sciences/educational_groups");
    if (page !== -1) { // il y n'y a pas d'erreur dans la requête
        const docRoot = parse(page);
        const groupsInputs = docRoot.querySelectorAll("#desktopGroupForm #educational_groups input");
        const groups = [];
        groupsInputs.forEach(input => { // obtiens l'id de chaque case à cocher qui contient celui de l'emploi du temps
            groups.push(input.id.replace("desktop-timetable-", ""));
        });
        groups.forEach(async group => {
            const exists = await Groupe.exists({
                identifiant: group
            });
            if (!exists) {
                const groupeObj = await new Groupe({
                    identifiant: group
                });
                groupeObj.save();
            }
        });
         
        return groups;
    }
}

export default getGroups;