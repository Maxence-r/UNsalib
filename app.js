import express, { json, urlencoded, static as serveStatic } from "express";
const app = express();

import { set, connect } from "mongoose";
import { hash } from 'bcrypt';
import Account from './src/backend/models/account.js';
import "dotenv/config";
import cookieParser from "cookie-parser";
import getGroups from "./src/backend/background/getGroups.js";
import sallesApi from "./src/backend/routes/api/salles.js";
import adminApi from "./src/backend/routes/api/admin.js";
import appInfosApi from "./src/backend/routes/api/app.js";
import adminDashboard from "./src/backend/routes/admin.js";
import authentification from "./src/backend/middlewares/auth.js";

// SECURITE SERVER
app.disable("x-powered-by");
app.use(cookieParser());

// DEFAULT MIDDLEWARES
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(serveStatic("./src/client"));

// API ROUTES
app.use(authentification);
app.use("/api/salles", sallesApi);
app.use("/api/admin", adminApi);
app.use("/api/app", appInfosApi);

// OTHER ROUTES
app.use("/admin", adminDashboard);

app.get("/", (req, res) => {
    console.log(process.env.MAINTENANCE);
    if (process.env.MAINTENANCE === "true") {
        res.sendFile("src/client/html/maintenance.html", { root: "." });
        return;
    }
    res.sendFile("src/client/html/main.html", { root: "." });
});

// DATABASE CONNECTION
set("strictQuery", true);
(async () => {
    try {
        await connect(`${process.env.MONGODB_URI}`, {});
        console.log("Connexion à MongoDB réussie !");
    } catch (err) {
        console.log("Connexion à MongoDB échouée !");
        console.log(err);
        process.exit(0);
    } finally {
        // SET UP ADMIN ACCOUNTS
        const adminUsernames = process.env.ADMIN_USERNAMES.split(',');
        const adminPasswords = process.env.ADMIN_PASSWORDS.split(',');
        await Account.deleteMany({});
        for (let i = 0; i < adminUsernames.length; i++) {
            const account = new Account({
                name: adminUsernames[i],
                lastname: adminUsernames[i],
                username: adminUsernames[i],
                password: await hash(adminPasswords[i], 10)
            });
            await account.save();
        }
        // EXECUTION PERMANENTE
        getGroups();
    }
})();

export default app;
