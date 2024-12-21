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
import root from "./src/backend/routes/root.js";

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
app.use("/", root);

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
        // console.log('Jean-Michel', await hash("lesupermotdepasse", 10))
        // EXECUTION PERMANENTE
        getGroups();
    }
})();

export default app;
