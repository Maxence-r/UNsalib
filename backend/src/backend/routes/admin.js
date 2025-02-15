import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/auth', async (req, res) => {
    if (req.connected) return res.redirect('/admin/dashboard');
    const filePath = join(__dirname, '../../client/html/auth.html');
    res.sendFile(filePath);
});

router.get('/', async (req, res) => {
    return res.redirect('/admin/dashboard');
});

router.get('/dashboard', async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');
    const filePath = join(__dirname, '../../client/html/admin.html');
    res.sendFile(filePath);
});

export default router;