import express from "express";
import Account from "../models/account.js";
import pkg from "jsonwebtoken";
import { compare } from "bcrypt";
import { CONFIG } from "../configs/app.config.js";
const router = express.Router();
const { sign } = pkg;

const TOKEN_VALIDITY_DAYS = 30;

router.post("/login", async (req, res) => {
    try {
        // Checking credentials
        const user = await Account.findOne({
            username: req.body.username.toLowerCase(),
        });
        if (!user) {
            return res.status(401).json({ error: "BAD_CREDENTIALS" });
        }
        const validPassword = await compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "BAD_CREDENTIALS" });
        }

        // If credentials are valid, a token is generated and a cookie sent
        const token = sign(
            {
                userId: user._id,
                username: user.username,
            },
            CONFIG.TOKEN,
            {
                expiresIn: `${TOKEN_VALIDITY_DAYS}d`,
            },
        );
        res.cookie("token", token, {
            domain: `.${CONFIG.PUBLIC_DOMAIN}`,
            maxAge: TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
            sameSite: "lax",
        })
            .status(200)
            .json({ message: "LOGIN_SUCCESSFUL" });
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error as string})`,
        );
    }
});

router.get("/logout", (req, res) => {
    // Clearing the cookie
    res.clearCookie("token", { domain: `.${CONFIG.PUBLIC_DOMAIN}` }).json({
        message: "LOGOUT_SUCCESSFUL",
    });
});

router.get("/status", (req, res) => {
    if (req.connected) {
        return res.json({ message: "LOGGED_IN" });
    }
    return res.json({ message: "NOT_LOGGED_IN" });
});

export default router;
