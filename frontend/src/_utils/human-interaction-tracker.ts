"use client";

const STORAGE_PREFIX = "unsalib_human_interaction";

type HumanInteractionType = "search_bar" | "homepage_scroll";

function getStorageKey(type: HumanInteractionType) {
    const today = new Date().toISOString().split("T")[0];
    return `${STORAGE_PREFIX}_${type}_${today}`;
}

export async function trackHumanInteraction(type: HumanInteractionType) {
    if (typeof window === "undefined") return;

    const storageKey = getStorageKey(type);
    if (localStorage.getItem(storageKey) === "true") {
        return;
    }

    localStorage.setItem(storageKey, "true");

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/rooms/interactions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ type })
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
    } catch (error) {
        localStorage.removeItem(storageKey);
        console.error("Failed to track human interaction:", error);
    }
}

export type { HumanInteractionType };
