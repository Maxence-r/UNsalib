import { ChartPie, House, Pen } from "lucide-react";

import { Home } from "./home/Home";
import type { ReactElement } from "react";
import { Buildings } from "./manage/buildings/Buildings";

interface View {
    id: string;
    name: string;
    icon: ReactElement<{ size: number }>;
    Component: () => ReactElement;
}

interface GroupView extends Omit<View, "Component"> {
    subviews: Omit<View, "icon">[];
}

const DASHBOARD_VIEWS: (View | GroupView)[] = [
    { id: "home", name: "Accueil", icon: <House />, Component: Home },
    {
        id: "manage",
        name: "Gestion",
        icon: <Pen />,
        subviews: [
            {
                id: "buildings",
                name: "Bâtiments",
                Component: Buildings,
            },
            {
                id: "rooms",
                name: "Salles",
                Component: (): ReactElement => <></>,
            },
        ],
    },
    {
        id: "stats",
        name: "Statistiques",
        icon: <ChartPie />,
        Component: (): ReactElement => <></>,
    },
];

export { DASHBOARD_VIEWS, type View, type GroupView };
