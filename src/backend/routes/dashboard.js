import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'
const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/', async (req, res) => {
    return res.redirect('/admin/dashboard');
});

router.get('/dashboard', async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');
    let filePath;
    filePath = join(__dirname, '../../client/html/dashboard.html');
    res.sendFile(filePath);
});

export default router;