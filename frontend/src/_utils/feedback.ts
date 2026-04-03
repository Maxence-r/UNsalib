"use client";

import { ApiFeedback } from "@/_utils/api-types";

export const FEEDBACK_STORAGE_KEYS = {
    FIRST_VISIT: "unsalib_first_visit_date",
    FEEDBACK_SUBMITTED: "unsalib_feedback_submitted",
    FEEDBACK_PROMPTED: "unsalib_feedback_prompted"
} as const;

const FEEDBACK_API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/feedback`;

interface CurrentFeedbackResponse {
    feedback: ApiFeedback | null;
}

interface SubmitFeedbackResponse {
    success?: boolean;
    error?: string;
    feedback?: ApiFeedback | null;
}

export function markFeedbackSubmittedInStorage() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(FEEDBACK_STORAGE_KEYS.FEEDBACK_SUBMITTED, "true");
}

export function isFeedbackSubmittedInStorage(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return localStorage.getItem(FEEDBACK_STORAGE_KEYS.FEEDBACK_SUBMITTED) === "true";
}

export function hasUnreadFeedbackReply(feedback: ApiFeedback | null): boolean {
    return Boolean(feedback?.hasUnreadReply);
}

export async function fetchCurrentFeedback(): Promise<ApiFeedback | null> {
    const response = await fetch(`${FEEDBACK_API_BASE}/me`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as CurrentFeedbackResponse;

    if (data.feedback) {
        markFeedbackSubmittedInStorage();
    }

    return data.feedback;
}

export async function submitFeedback({
    rating,
    comment,
}: {
    rating: number;
    comment: string;
}): Promise<SubmitFeedbackResponse> {
    const response = await fetch(`${FEEDBACK_API_BASE}/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            rating,
            comment,
        }),
    });

    const data = (await response.json()) as SubmitFeedbackResponse;

    if (response.ok && data.success) {
        markFeedbackSubmittedInStorage();
        return data;
    }

    return {
        success: false,
        error: data.error || "INTERNAL_ERROR",
        feedback: data.feedback ?? null,
    };
}

export async function markFeedbackReplyAsSeen(): Promise<void> {
    const response = await fetch(`${FEEDBACK_API_BASE}/reply-seen`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
}
