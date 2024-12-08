import { Router } from 'express';
const router = Router();
import { join } from 'path';
import Account, { findOne } from '../../models/account';
import { compare, hash as _hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
require('dotenv').config();
import { findOne as _findOne, deleteOne } from '../../models/a2f';
import authorizeA2F from '../../middlewares/authentification/authorizeA2f';
import validateAccount from '../../middlewares/modelsValidation/validateAccount';
import { sendMail } from '../mail/mailing';
import rateLimit from '../../middlewares/authentification/rateLimit';

router.get('/signin', async (req, res) => {
    if (req.connected) return res.redirect('/dashboard');
    const filePath = join(__dirname, '../../views/pages/authentification/signin.html');
    res.sendFile(filePath);
});

router.get('/signup', async (req, res) => {
    if (req.connected) return res.redirect('/dashboard');
    const filePath = join(__dirname, '../../views/pages/authentification/signup.html');
    res.sendFile(filePath);
});

router.get('/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

router.post('/signin', rateLimit(3), async (req, res) => {
    try {
        const user = await findOne({ mail: req.body.mail.toLowerCase() });
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

        if (user.suspended.reason) {
            return res.status(403).json({
                error: "Votre compte a été suspendu ! Merci de consulter vos mails pour plus d'informations.",
            });
        }
        if (user.isA2FEnabled) {
            await sendMail('a2f', user.mail);
            res.status(200).json({
                a2f: true,
            });
        } else {
            const token = sign(
                {
                    userId: user._id,
                    mail: user.mail,
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
        }
    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({
            error,
        });
    }
});

router.post('/signup', rateLimit(1), validateAccount, async (req, res) => {
    const account = new Account({
        name: req.body.name,
        lastname: req.body.lastname,
        mail: req.body.mail.toLowerCase(),
        password: req.body.password,
        accountType: req.body.accountType,
        username: req.body.name.substring(0, 1) + req.body.lastname.substring(0, 22),
    });
    try {
        const hash = await _hash(account.password, 10);
        account.password = hash;
        const newAccount = await account.save();
        const token = sign(
            {
                userId: newAccount._id,
                mail: newAccount.mail,
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
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
});

router.post('/authorize', rateLimit(3), async (req, res) => {
    try {
        const a2f = await _findOne({ owner: req.body.mail, code: req.body.code });
        if (!a2f || a2f.expireAt < new Date()) {
            res.status(400).json({ error: 'Code invalide !' });
        } else {
            const user = await findOne({ mail: a2f.owner });
            if (!user) {
                return res.status(400).json({ error: 'Utilisateur non trouvé !' });
            }
            const token = sign(
                {
                    userId: user._id,
                    mail: user.mail,
                },
                process.env.TOKEN.toString(),
                {
                    expiresIn: '60d',
                }
            );
            await deleteOne({ owner: a2f.owner });
            res.cookie('token', token, { maxAge: 60 * 24 * 60 * 60 * 1000, sameSite: 'Lax' })
                .status(200)
                .json({
                    message: 'Connexion réussie !',
                });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.post('/resetpassword', rateLimit(3), authorizeA2F, async (req, res) => {
    try {
        if (req.body.password.length < 6) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères !' });
        }
        const user = await findOne({ mail: req.body.mail });
        if (!user) {
            return res.status(400).json({ error: "L'utilisateur n'existe pas !" });
        }
        const hash = await _hash(req.body.password, 10);
        user.password = hash;
        await user.save();
        await deleteOne({ owner: req.body.mail });
        res.status(200).json({ message: 'Mot de passe modifié !' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;