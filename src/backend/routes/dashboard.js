import { Router } from 'express';
const router = Router();

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import Account from '../models/account.js';
import { compare, hash } from 'bcrypt';
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
    // console.log(await hash("coucou", 10));
    // return;
    // const groupeObj = new Account({
    //     name: "test",
    //     lastname: "test",
    //     username: "test",
    //     password: "$2b$10$IcneRbBU0NzmeSuYAruY2OmOasgNxP2m6AGJvH9CsNtTNr/bzGVBW"
    // });
    // await groupeObj.save();
    try {
        const user = await Account.findOne({ username: req.body.mail.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non trouvé !',
            });
        }
        const validPassword = await compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                error: 'Mot de passe incorrect !',
            });
        }

        const token = sign(
            {
                userId: user._id,
                mail: user.username,
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
        console.log('error: ', error);
        res.status(500).json({
            error,
        });
    }
});

router.get('/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('auth');
});

export default router;