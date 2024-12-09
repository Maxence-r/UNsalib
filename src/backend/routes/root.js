import { Router } from 'express';
const router = Router();

router.get("/", (req, res) => {
    console.log(process.env.MAINTENANCE);
    if (process.env.MAINTENANCE === "true") {
        res.sendFile("src/client/html/maintenance.html", { root: "." });
        return;
    }
    res.sendFile("src/client/html/main.html", { root: "." });
});


export default router;