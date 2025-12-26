const START_DAY_HOUR = 8;
const END_DAY_HOUR = 19;
const DAY_DURATION = END_DAY_HOUR - START_DAY_HOUR;
const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const VERSION_NUMBER = "3.0";
const VERSION_NAME = "Louisa";
const PALETTE_HEX = [
    "#1abc9c",
    "#f1c40f",
    "#2ecc71",
    "#e67e22",
    "#3498db",
    "#e74c3c",
    "#9b59b6",
    "#95a5a6",
    "#16a085",
    "#f39c12",
    "#27ae60",
    "#d35400",
    "#2980b9",
    "#c0392b",
    "#8e44ad",
    "#bdc3c7",
];
const MIN_WIDTH_BREAKPOINTS = {
    mobile: 0,
    tablet: 480,
    desktop: 1024,
};

const THEME: {
    [key: string]: { [key: string]: string | { light: string; dark: string } };
} = {
    color: {
        accent: "#3452FF",
        accentDark: "#1F2DFF",
        onAccent: "#FFFFFF",
        neutralLight: { light: "#EFEFF4", dark: "#242528" },
        neutral: { light: "#DEDEE2", dark: "#404044" },
        neutralDark: { light: "#6F7073", dark: "#7E7F83" },
        background: { light: "#FFFFFF", dark: "#121216" },
        backgroundDark: { light: "#F9F9FC", dark: "#16161A" },
        onSurface: { light: "#010205", dark: "#F6F7FA" },
        success: "#44C235",
        onSuccess: "#FFFFFF",
        error: "#E64242",
        onError: "#FFFFFF",
    },
    radius: {
        normal: "12px",
    },
};

export {
    START_DAY_HOUR,
    END_DAY_HOUR,
    DAY_DURATION,
    WEEK_DAYS,
    VERSION_NUMBER,
    VERSION_NAME,
    PALETTE_HEX,
    MIN_WIDTH_BREAKPOINTS,
    THEME,
};
