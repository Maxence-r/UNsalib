import express, { json, urlencoded, static as serveStatic } from 'express';
const app = express();
import cors from 'cors';

import { set, connect } from 'mongoose';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import launch from './src/backend/background/main.js';
import sallesApi from './src/backend/routes/api/rooms.js';
import adminApi from './src/backend/routes/api/admin.js';
import adminDashboard from './src/backend/routes/admin.js';
import authentication from './src/backend/middlewares/auth.js';
import stats from './src/backend/middlewares/stats.js';

// SECURITE SERVER
app.disable('x-powered-by');
app.use(cookieParser());

// DEFAULT MIDDLEWARES
app.use(cors({
    origin: [process.env.PUBLIC_FRONTEND_URL, process.env.PRIVATE_FRONTEND_URL],
    credentials: true
}));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(serveStatic('./src/client'));

// Serve the .well-known directory
app.use('/.well-known', serveStatic('./.well-known'));

// API ROUTES
app.use(authentication);
app.use(stats);
app.use('/api/rooms', sallesApi);
app.use('/api/admin', adminApi);

// OTHER ROUTES
app.use('/admin', adminDashboard);
// 404 FALLBACK
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'NOT_FOUND' });
});

// DATABASE CONNECTION
set('strictQuery', true);
(async () => {
    try {
        await connect(`${process.env.MONGODB_URI}`, {});
        console.log('Connexion à MongoDB réussie !');
    } catch (err) {
        console.log('Connexion à MongoDB échouée !');
        console.log(err);
        process.exit(0);
    } finally {
        // console.log('Jean-Michel', await hash('lesupermotdepasse', 10))
        // EXECUTION PERMANENTE
        launch();
    }
})();

export default app;