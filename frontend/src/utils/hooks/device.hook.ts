// Adapted from https://stackoverflow.com/a/66588540
// Posted by Dori Lahav Waisberg, modified by community

import { useEffect, useState } from "react";

import { MIN_WIDTH_BREAKPOINTS } from "../constants";

function getDevice() {
    if (
        window.matchMedia(`(min-width: ${MIN_WIDTH_BREAKPOINTS.desktop}px)`)
            .matches
    ) {
        return "desktop";
    } else if (
        window.matchMedia(`(min-width: ${MIN_WIDTH_BREAKPOINTS.tablet}px)`)
            .matches
    ) {
        return "tablet";
    }
    return "mobile";
}

function useDeviceType() {
    const [deviceType, setDeviceType] = useState<
        "desktop" | "tablet" | "mobile"
    >(getDevice());

    useEffect(() => {
        const onResize = () => {
            setDeviceType(getDevice());
        };

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return deviceType;
}

export { useDeviceType };
