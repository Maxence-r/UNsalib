"use client";

import { openDrawer, setDrawerContent } from "@/_components/drawer";
import FeedbackDrawerContent from "@/_components/feedback";
import { ApiFeedback } from "@/_utils/api-types";
import {
    FEEDBACK_STORAGE_KEYS,
    fetchCurrentFeedback,
    hasUnreadFeedbackReply,
    isFeedbackSubmittedInStorage,
} from "@/_utils/feedback";

function showFeedbackDrawer(
    feedback?: ApiFeedback | null,
    markReplyAsSeenOnMount: boolean = false,
) {
    setDrawerContent(
        <FeedbackDrawerContent
            initialFeedback={feedback}
            markReplyAsSeenOnMount={markReplyAsSeenOnMount}
        />,
    );
    openDrawer();
}

function maybePromptForFeedback() {
    if (isFeedbackSubmittedInStorage()) {
        return;
    }

    const firstVisitDate = localStorage.getItem(FEEDBACK_STORAGE_KEYS.FIRST_VISIT);
    const feedbackPrompted = localStorage.getItem(FEEDBACK_STORAGE_KEYS.FEEDBACK_PROMPTED);
    const today = new Date().toISOString().split("T")[0];

    if (!firstVisitDate) {
        localStorage.setItem(FEEDBACK_STORAGE_KEYS.FIRST_VISIT, today);
        return;
    }

    if (firstVisitDate !== today && feedbackPrompted !== "true") {
        setTimeout(() => {
            showFeedbackDrawer(null, false);
            localStorage.setItem(FEEDBACK_STORAGE_KEYS.FEEDBACK_PROMPTED, "true");
        }, 2000);
    }
}

export function initializeVisitTracking() {
    if (typeof window === "undefined") {
        return;
    }

    void (async () => {
        try {
            const currentFeedback = await fetchCurrentFeedback();

            if (currentFeedback) {
                if (hasUnreadFeedbackReply(currentFeedback)) {
                    setTimeout(() => {
                        showFeedbackDrawer(currentFeedback, true);
                    }, 1200);
                }
                return;
            }
        } catch (error) {
            console.error("Error checking current feedback:", error);
        }

        maybePromptForFeedback();
    })();
}

export function openFeedbackDrawer() {
    void (async () => {
        try {
            const currentFeedback = await fetchCurrentFeedback();
            showFeedbackDrawer(currentFeedback, hasUnreadFeedbackReply(currentFeedback));
        } catch (error) {
            console.error("Error opening feedback drawer:", error);
            showFeedbackDrawer(undefined, false);
        }
    })();
}

export function hasFeedbackBeenSubmitted(): boolean {
    return isFeedbackSubmittedInStorage();
}

export function resetFeedbackTracking() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(FEEDBACK_STORAGE_KEYS.FIRST_VISIT);
    localStorage.removeItem(FEEDBACK_STORAGE_KEYS.FEEDBACK_SUBMITTED);
    localStorage.removeItem(FEEDBACK_STORAGE_KEYS.FEEDBACK_PROMPTED);
}
