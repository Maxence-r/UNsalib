import express, { json, urlencoded, static as serveStatic } from "express";
const app = express();

import { set, connect } from "mongoose";
import 'dotenv/config'
import getGroups from "./src/backend/background/getGroups.js";


import salles from "./src/backend/routes/salles.js";

// SECURITE SERVER
app.disable("x-powered-by");

// DEFAULT MIDDLEWARES
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(serveStatic("./src/client"));

// ROUTES
app.use('/salles', salles)

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
        // EXECUTION PERMANENTE
        getGroups();
    }
})();

export default app;