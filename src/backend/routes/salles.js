import express from 'express';
const router = express.Router();
import Salle from '../models/salle.js';
import Cours from '../models/cours.js';
// GET 
router.get('/free', async (req, res) => {

    // Récupérer la liste de toutes les salles
    const salles = await Salle.find();
    const cours = await Cours.find({
        debute_a : {
            $gte : req.query.start
        },
        fini_a : {
            $lte : req.query.end
        }
    });



    // récupère tout les cours entre les deux periodes début "req.query.start" et fin "req.query.end"

    salles.forEach(salle => {
        if (cours.find(cours => cours.classe == salle._id)) {
            salles.splice(salles.indexOf(salle), 1);
        }
    });
    

    res.send(salles);

})




router.get('/timetable/:id', async (req, res) => {
    const id = req.params.id;
    let salle = await Salle.findById(id);
    if (!salle) {
        res.status(404).send("Salle non existante");
    }


    const cours = await Cours.find({
        classe: id
    });


    res.send(cours)
    
    
});
export default router;