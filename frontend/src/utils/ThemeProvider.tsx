import { useEffect, type ReactNode } from "react";

import { useColorScheme } from "./hooks/colorScheme.hook";
import { THEME } from "./constants";

function setThemeProperty(category: string, property: string, value: string) {
    const kebabCategory = category.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
    );
    const kebabProperty = property.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
    );

    document.documentElement.style.setProperty(
        `--${kebabCategory}-${kebabProperty}`,
        value,
    );
}

function setTheme(isLight: boolean) {
    Object.keys(THEME).forEach((category) => {
        Object.keys(THEME[category]).forEach((property) => {
            if (typeof THEME[category][property] === "string") {
                setThemeProperty(category, property, THEME[category][property]);
            } else {
                if (isLight) {
                    setThemeProperty(
                        category,
                        property,
                        THEME[category][property].light,
                    );
                } else {
                    setThemeProperty(
                        category,
                        property,
                        THEME[category][property].dark,
                    );
                }
            }
        });
    });
}

function ThemeProvider({ children }: { children: ReactNode }) {
    const colorScheme = useColorScheme();

    useEffect(() => {
        if (colorScheme === "light") {
            setTheme(true);
        } else {
            setTheme(false);
        }
    }, [colorScheme]);

    return children;
}

export { ThemeProvider };
