import { Router } from 'express';
const router = Router();

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import Account from '../models/account.js';
import { compare } from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import 'dotenv/config'

router.get('/', async (req, res) => {
    return res.redirect('admin/dashboard');
});

router.get('/dashboard', async (req, res) => {
    if (!req.connected) return res.redirect('auth');
    let filePath;
    filePath = join(__dirname, '../../client/html/dashboard.html');
    res.sendFile(filePath);
});

router.get('/auth', async (req, res) => {
    if (req.connected) return res.redirect('dashboard');
    const filePath = join(__dirname, '../../client/html/auth.html');
    res.sendFile(filePath);
});

router.post('/auth', async (req, res) => {
    try {
        const user = await Account.findOne({ username: req.body.username.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                error: 'BAD_CREDENTIALS',
            });
        }
        const validPassword = await compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'BAD_CREDENTIALS',
            });
        }

        const token = sign(
            {
                userId: user._id,
                username: user.username,
            },
            process.env.TOKEN.toString(),
            {
                expiresIn: '60d',
            }
        );
        res.cookie('token', token, { maxAge: 60 * 24 * 60 * 60 * 1000, sameSite: 'Lax' })
            .status(200)
            .json({
                message: 'Connexion réussie !',
            });
    } catch (error) {
        res.status(500).json({
            error: 'INTERNAL_ERROR',
        });
        console.error(
            "Erreur pendant le traitement de la requête à",
            req.url,
            `(${erreur.message})`
        );
    }
});

router.get('/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('auth');
});

export default router;