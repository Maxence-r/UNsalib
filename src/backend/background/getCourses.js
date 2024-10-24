/* import Salle from '../models/salle.js'; */
import Groupe from '../models/groupe.js';
import Cours from '../models/cours.js';
import Salle from '../models/salle.js';

export const getCourses = async () => {
    const groupes = await Groupe.find();
    const base_url = "https://edt-v2.univ-nantes.fr/events?start=2024-10-25&end=2024-11-10";
    const chunkSize = 40; // Adjust the chunk size as needed

    // Function to split array into chunks
    function chunkArray(array, size) {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    // Split groupes into chunks
    const groupeChunks = chunkArray(groupes, chunkSize);

    for (const chunk of groupeChunks) {
        let url_requete = base_url;

        chunk.forEach(groupe => {
            url_requete += '&timetables%5B%5D=' + groupe.identifiant;
        });

        let reponse = null;
        try {
            reponse = await fetch(url_requete);
        } catch (error) {
            console.log("Erreur lors de l'obtention de la page ", url_requete, ":", error)
            continue;
        }
        const data = await reponse.json();

        for (const cours of data) {

            const excludedSalles = ['Med', 'droit', 'Salle extérieure', 'Ireste', 'Isitem', 'IAE', 'Gavy', 'Pas de salle', 'Salle Manquante', 'Bias', '1B-05'];

            const isExcluded = excludedSalles.some(excluded => cours.rooms_for_blocks.includes(excluded));

            console.log(cours.rooms_for_blocks, isExcluded);

            if (!cours.start_at || !cours.end_at || !cours.rooms_for_blocks || isExcluded) {
                continue;
            }

            const exists = await Cours.exists({
                identifiant: cours.id
            });



            let salleExist;
            if (cours.rooms_for_blocks) {
                const salles = cours.rooms_for_blocks.split(';');

                for (const salle of salles) {
                    if (salle) {
                        salleExist = await Salle.exists({
                            nom_salle: salle.includes("(") ? salle.split("(")[0].trim() : salle.trim()
                        });
                        if (!salleExist) {
                            const salleObj = new Salle({
                                nom_salle: salle.includes("(") ? salle.split("(")[0].trim() : salle.trim(),
                                batiment: salle.includes("(") ? salle.split("(")[1].split(")")[0] : salle,
                                places_assises: 0
                            });
                            await salleObj.save();
                            salleExist = salleObj;
                        }
                    }
                }
            }


            const coursObj = new Cours({
                identifiant: cours.id,
                debute_a: cours.start_at ? cours.start_at : "Non renseigné",
                fini_a: cours.end_at ? cours.end_at : "Non renseigné",
                professeur: cours.teachers_for_blocks ? cours.teachers_for_blocks : "Non renseigné",
                classe: salleExist._id ? salleExist._id : "Non renseigné",
                module: cours.modules_for_blocks ? cours.modules_for_blocks : "Non renseigné",
                groupe: cours.educational_groups_for_blocks ? cours.educational_groups_for_blocks : "Non renseigné"
            });


            if (!exists) {
                await coursObj.save();
            }
        }
    }
};

