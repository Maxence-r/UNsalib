import { Router } from 'express';
const router = Router();
import 'dotenv/config';

router.get('/', (req, res) => {
    res.sendFile('src/client/html/maintenance.html', { root: '.' });
});


router.get('/campus', (req, res) => {
    res.sendFile('src/client/html/campus.html', { root: '.' });
});

export default router;