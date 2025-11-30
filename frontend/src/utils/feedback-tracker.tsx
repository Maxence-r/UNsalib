"use client";

import { openDrawer, setDrawerContent } from "@/_components/drawer";
import FeedbackDrawerContent from "@/_components/feedback";

const STORAGE_KEYS = {
    FIRST_VISIT: "unsalib_first_visit_date",
    FEEDBACK_SUBMITTED: "unsalib_feedback_submitted",
    FEEDBACK_PROMPTED: "unsalib_feedback_prompted"
};

/**
 * Initialize visit tracking when app loads
 * This should be called in the main app component
 */
export function initializeVisitTracking() {
    if (typeof window === "undefined") return;

    // Check if feedback already submitted
    const feedbackSubmitted = localStorage.getItem(STORAGE_KEYS.FEEDBACK_SUBMITTED);
    if (feedbackSubmitted === "true") {
        return; // Don't track or prompt anymore
    }

    const firstVisitDate = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
    const feedbackPrompted = localStorage.getItem(STORAGE_KEYS.FEEDBACK_PROMPTED);
    const today = new Date().toISOString().split("T")[0];

    if (!firstVisitDate) {
        // First time user visits
        localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, today);
        console.log("First visit tracked:", today);
        return;
    }

    // Check if it's a different day than the first visit
    if (firstVisitDate !== today && feedbackPrompted !== "true") {
        // It's the second day, show feedback drawer
        console.log("Second day visit detected, showing feedback drawer");
        
        // Small delay to let the page load first
        setTimeout(() => {
            setDrawerContent(<FeedbackDrawerContent />);
            openDrawer();
            localStorage.setItem(STORAGE_KEYS.FEEDBACK_PROMPTED, "true");
        }, 2000); // 2 second delay for smooth UX
    }
}

/**
 * Manually trigger feedback drawer (for button in About section)
 */
export function openFeedbackDrawer() {
    setDrawerContent(<FeedbackDrawerContent />);
    openDrawer();
}

/**
 * Check if user has already submitted feedback
 */
export function hasFeedbackBeenSubmitted(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEYS.FEEDBACK_SUBMITTED) === "true";
}

/**
 * Reset feedback tracking (for development/testing)
 */
export function resetFeedbackTracking() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.FIRST_VISIT);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK_SUBMITTED);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK_PROMPTED);
    console.log("Feedback tracking reset");
}
