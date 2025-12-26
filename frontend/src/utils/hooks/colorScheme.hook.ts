import { useEffect, useState } from "react";

function useColorScheme() {
    const [colorScheme, setColorScheme] = useState<"light" | "dark">(
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
    );

    useEffect(() => {
        const onChange = (event: MediaQueryListEvent) => {
            setColorScheme(event.matches ? "dark" : "light");
        };

        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", onChange);

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", onChange);
        };
    }, []);

    return colorScheme;
}

export { useColorScheme };
