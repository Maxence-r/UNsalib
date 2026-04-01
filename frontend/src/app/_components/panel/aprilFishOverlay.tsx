"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import "./aprilFishOverlay.css";

const DISPLAY_DURATION_MS = 5400;
const PARIS_TIMEZONE = "Europe/Paris";

const FISH_POSITIONS = [
    {
        key: "topLeft",
        className: "aprilFishOverlay__fish--topLeft",
        delay: "0s",
        size: "clamp(88px, 12vw, 170px)"
    },
    {
        key: "topRight",
        className: "aprilFishOverlay__fish--topRight",
        delay: "0.18s",
        size: "clamp(94px, 13vw, 180px)"
    },
    {
        key: "bottomLeft",
        className: "aprilFishOverlay__fish--bottomLeft",
        delay: "0.34s",
        size: "clamp(86px, 11vw, 162px)"
    },
    {
        key: "bottomRight",
        className: "aprilFishOverlay__fish--bottomRight",
        delay: "0.5s",
        size: "clamp(92px, 12vw, 176px)"
    }
];

function getParisDateParts() {
    try {
        const formatter = new Intl.DateTimeFormat("fr-FR", {
            timeZone: PARIS_TIMEZONE,
            day: "numeric",
            month: "numeric",
            year: "numeric"
        });
        const parts = formatter.formatToParts(new Date());

        return {
            day: Number(parts.find((part) => part.type === "day")?.value ?? "0"),
            month: Number(parts.find((part) => part.type === "month")?.value ?? "0"),
            year: Number(parts.find((part) => part.type === "year")?.value ?? "0")
        };
    } catch {
        const now = new Date();

        return {
            day: now.getDate(),
            month: now.getMonth() + 1,
            year: now.getFullYear()
        };
    }
}

export default function AprilFishOverlay() {
    const [hasBeenShown, setHasBeenShown] = useState(false);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const { day, month } = getParisDateParts();

        if (day !== 1 || month !== 4) {
            return;
        }

        setHasBeenShown(true);

        const timeout = window.setTimeout(() => {
            setHasBeenShown(false);
        }, DISPLAY_DURATION_MS);

        return () => {
            window.clearTimeout(timeout);
        };
    }, []);

    if (!hasBeenShown) {
        return null;
    }

    return (
        <div className="aprilFishOverlay" aria-hidden="true">
            {FISH_POSITIONS.map((fish) => (
                <div
                    key={fish.key}
                    className={`aprilFishOverlay__fish ${fish.className}`}
                    style={{
                        "--delay": fish.delay,
                        "--size": fish.size
                    } as CSSProperties}
                >
                    <Image
                        className="aprilFishOverlay__image"
                        src="/april-fish.png"
                        alt=""
                        width={670}
                        height={439}
                        sizes="(max-width: 768px) 34vw, 180px"
                        priority
                    />
                </div>
            ))}
        </div>
    );
}
