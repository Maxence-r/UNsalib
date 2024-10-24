import express, { json, urlencoded, static as serveStatic } from "express";
import { getCourses } from "./src/backend/background/getCourses.js";
const app = express();

import { set, connect } from "mongoose";
import 'dotenv/config'
import getGroups from "./src/backend/background/getGroups.js";


// EXECUTION PERMANENTE
getGroups();
getCourses();

// SECURITE SERVER
app.disable("x-powered-by");

// DEFAULT MIDDLEWARES
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(serveStatic("./src/client"));




// DATABASE CONNECTION
set("strictQuery", true);
(async () => {
    try {
        await connect(`${process.env.MONGODB_URI}`, {});
        console.log("Connexion à MongoDB réussie !");
    } catch (err) {
        console.log("Connexion à MongoDB échouée !");
        console.log(err);
    }
})();


export default app;