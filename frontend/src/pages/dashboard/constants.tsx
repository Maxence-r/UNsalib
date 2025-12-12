import { ChartPie, House, Pen } from "lucide-react";

const VIEWS = [
    { id: "home", name: "Accueil", icon: <House />, component: <></> },
    { id: "manage", name: "Gestion", icon: <Pen />, component: <></> },
    { id: "stats", name: "Statistiques", icon: <ChartPie />, component: <></> },
];

export {VIEWS}