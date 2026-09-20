import { useEffect, useState } from "react";

function useColorScheme(): "light" | "dark" {
    const [colorScheme, setColorScheme] = useState<"light" | "dark">(
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
    );

    useEffect(() => {
        const onChange = (event: MediaQueryListEvent): void => {
            setColorScheme(event.matches ? "dark" : "light");
        };

        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", onChange);

        return (): void => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", onChange);
        };
    }, []);

    return colorScheme;
}

export { useColorScheme };
