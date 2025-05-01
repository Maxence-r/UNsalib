import express, { json, urlencoded } from "express";
import cors from "cors";
import { set, connect } from "mongoose";
import "dotenv/config";
import cookieParser from "cookie-parser";

import launch from "./src/background/main.js";
import roomsRoutes from "./src/routes/rooms.js";
import adminRoutes from "./src/routes/admin.js";
import authRoutes from "./src/routes/auth.js";
import authMiddleware from "./src/middlewares/auth.js";
import statsMiddleware from "./src/middlewares/stats.js";

const app = express();

// Server security
app.disable("x-powered-by");
// Default
app.use(cors({
    origin: [process.env.PUBLIC_FRONTEND_URL, process.env.PRIVATE_FRONTEND_URL],
    credentials: true
}));
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

// API middlewares
app.use(authMiddleware);
app.use(statsMiddleware);
// API routes
app.use("/rooms", roomsRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
// 404 fallback
app.use((req, res) => {
    res.status(404);
    res.json({ error: "NOT_FOUND" });
});

// Database connection
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
        // console.log("Jean-Michel", await hash("lesupermotdepasse", 10))
        // EXECUTION PERMANENTE
        launch();
    }
})();

export default app;