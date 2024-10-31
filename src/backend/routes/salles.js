import express from 'express';
const router = express.Router();
import Salle from '../models/salle.js';
import Cours from '../models/cours.js';
import mongoose from 'mongoose';

// GET 
router.get('/available', async (req, res) => {
    try {
        // 1. First, find all rooms that have courses during the specified period
        const occupiedRoomIds = await Cours.distinct('classe', {
            debute_a: { $gte: req.query.start },
            fini_a: { $lte: req.query.end }
        });

        // 2. Then find all rooms that are NOT in the occupied rooms list
        const availableRooms = await Salle.find({
            _id: { $nin: occupiedRoomIds }
        });

        res.json(availableRooms);
    } catch (error) {
        res.status(500).json({
            message: "Error finding available rooms",
            error: error.message
        });
    }
});

router.get('/timetable/:id', async (req, res) => {
    const id = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format");
    }

    try {
        let salle = await Salle.findById(id).sort({ id: 1 });
        if (!salle) {
            return res.status(404).send("Salle non existante");
        }

        const cours = await Cours.find({ classe: id });
        res.send(cours);
    } catch (error) {
        console.error("Error fetching timetable:", error);
        res.status(500).send("Internal Server Error");
    }
});
export default router;