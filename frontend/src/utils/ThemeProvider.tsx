import { useEffect, useState, type ReactNode } from "react";

import { useColorScheme } from "./hooks/colorScheme.hook";
import { THEME } from "./constants";

function getKebabProperty(category: string, property: string) {
    const kebabCategory = category.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
    );
    const kebabProperty = property.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
    );

    return `--${kebabCategory}-${kebabProperty}`;
}

function getCssTheme(isLight: boolean) {
    const cssStyle: { [key: string]: string } = {};

    Object.keys(THEME).forEach((category) => {
        Object.keys(THEME[category]).forEach((property) => {
            if (typeof THEME[category][property] === "string") {
                cssStyle[getKebabProperty(category, property)] =
                    THEME[category][property];
            } else {
                if (isLight) {
                    cssStyle[getKebabProperty(category, property)] =
                        THEME[category][property].light;
                } else {
                    cssStyle[getKebabProperty(category, property)] =
                        THEME[category][property].dark;
                }
            }
        });
    });

    return cssStyle;
}

function ThemeProvider({ children }: { children: ReactNode }) {
    const colorScheme = useColorScheme();
    const [style, setStyle] = useState<{ [key: string]: string }>(
        getCssTheme(colorScheme === "light"),
    );

    useEffect(() => {
        setStyle(getCssTheme(colorScheme === "light"));
    }, [colorScheme]);

    return (
        <div style={{ height: "inherit", width: "inherit", ...style }}>
            {children}
        </div>
    );
}

export { ThemeProvider };
