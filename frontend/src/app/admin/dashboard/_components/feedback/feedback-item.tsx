"use client";

import { ReactNode, useEffect, useState } from "react";
import { Copy, Eye, EyeOff, Send } from "lucide-react";

import Button from "@/_components/button";
import { Card, CardContent } from "@/_components/card";
import { showToast, setToastMessage } from "@/_components/toast";
import { ApiFeedback } from "@/_utils/api-types";
import { submitFeedbackReply } from "../../_utils/client-actions";

export default function FeedbackItem({
    feedback,
    formatDate,
    renderStars,
    onFeedbackUpdated,
}: {
    feedback: ApiFeedback;
    formatDate: (dateString: string) => string;
    renderStars: (rating: number) => ReactNode;
    onFeedbackUpdated: (feedback: ApiFeedback) => void;
}) {
    const [replyDraft, setReplyDraft] = useState(feedback.adminReply || "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setReplyDraft(feedback.adminReply || "");
    }, [feedback.adminReply]);

    const trimmedReply = replyDraft.trim();
    const isReplyChanged = trimmedReply !== feedback.adminReply;
    const canSave = trimmedReply.length > 0 && isReplyChanged && !isSaving;
    const statusLabel = !feedback.hasAdminReply
        ? "À répondre"
        : feedback.hasUnreadReply
            ? "En attente de lecture"
            : "Réponse vue";
    const statusClassName = !feedback.hasAdminReply
        ? "feedback-status--idle"
        : feedback.hasUnreadReply
            ? "feedback-status--pending"
            : "feedback-status--seen";

    const handleCopyDeviceId = async () => {
        try {
            await navigator.clipboard.writeText(feedback.userId);
            setToastMessage("ID appareil copié.", false);
        } catch (error) {
            console.error("Error copying device id:", error);
            setToastMessage("Impossible de copier l'ID appareil.", true);
        }

        showToast();
    };

    const handleSaveReply = async () => {
        if (!canSave) {
            return;
        }

        setIsSaving(true);

        try {
            const result = await submitFeedbackReply(feedback.userId, trimmedReply);

            if (!result.success || !result.feedback) {
                setToastMessage("Impossible d'enregistrer la réponse.", true);
                showToast();
                return;
            }

            onFeedbackUpdated(result.feedback);
            setReplyDraft(result.feedback.adminReply);
            setToastMessage("Réponse enregistrée.", false);
            showToast();
        } catch (error) {
            console.error("Error saving feedback reply:", error);
            setToastMessage("Impossible d'enregistrer la réponse.", true);
            showToast();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="feedback-card">
            <CardContent>
                <div className="feedback-card-body">
                    <div className="feedback-card-header">
                        <div className="feedback-card-meta">
                            <div className="comment-rating">
                                {renderStars(feedback.rating)}
                            </div>
                            <span className="comment-date">
                                {formatDate(feedback.createdAt)}
                            </span>
                        </div>
                        <span className={`feedback-status ${statusClassName}`}>
                            {statusLabel}
                        </span>
                    </div>

                    <div className="feedback-device">
                        <div className="feedback-device-content">
                            <span className="feedback-device-label">ID appareil</span>
                            <code className="feedback-device-id">{feedback.userId}</code>
                        </div>
                        <button
                            type="button"
                            className="feedback-device-copy"
                            onClick={handleCopyDeviceId}
                            aria-label="Copier l'ID appareil"
                        >
                            <Copy size={16} />
                            <span>Copier</span>
                        </button>
                    </div>

                    <div className="feedback-thread">
                        <div className="feedback-bubble feedback-bubble--user">
                            <span className="feedback-bubble-label">Retour utilisateur</span>
                            <p className="feedback-bubble-meta">Note : {feedback.rating}/5</p>
                            <p className="feedback-bubble-text">
                                {feedback.comment.trim().length > 0
                                    ? feedback.comment
                                    : "Aucun commentaire. L'utilisateur a uniquement laissé une note."}
                            </p>
                        </div>

                        {feedback.hasAdminReply && (
                            <>
                                <div className="feedback-reply-indicator">
                                    <span
                                        className={`feedback-reply-indicator-badge ${
                                            feedback.hasUnreadReply
                                                ? "feedback-reply-indicator-badge--pending"
                                                : "feedback-reply-indicator-badge--seen"
                                        }`}
                                    >
                                        {feedback.hasUnreadReply ? <EyeOff size={16} /> : <Eye size={16} />}
                                        <span>
                                            {feedback.hasUnreadReply
                                                ? "Pas encore lue"
                                                : "Réponse consultée"}
                                        </span>
                                    </span>
                                    <span className="feedback-reply-indicator-text">
                                        {feedback.replySeenAt
                                            ? `Vue le ${formatDate(feedback.replySeenAt)}`
                                            : "L'utilisateur n'a pas encore rouvert l'application."}
                                    </span>
                                </div>

                                <div className="feedback-bubble feedback-bubble--admin">
                                    <span className="feedback-bubble-label">Réponse envoyée</span>
                                    {feedback.adminRepliedAt && (
                                        <p className="feedback-bubble-meta">
                                            {formatDate(feedback.adminRepliedAt)}
                                        </p>
                                    )}
                                    <p className="feedback-bubble-text">
                                        {feedback.adminReply}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="feedback-editor">
                        <label htmlFor={`feedback-reply-${feedback.id}`}>
                            Réponse affichée dans l&apos;application
                        </label>
                        <textarea
                            id={`feedback-reply-${feedback.id}`}
                            value={replyDraft}
                            onChange={(event) => setReplyDraft(event.target.value)}
                            placeholder="Rédigez votre réponse pour cet appareil..."
                            maxLength={1000}
                            rows={4}
                        />
                        <div className="feedback-editor-footer">
                            <span className="feedback-editor-hint">
                                Cette réponse apparaîtra à la prochaine ouverture de l&apos;application sur cet appareil.
                            </span>
                            <Button
                                className={`primary${
                                    isSaving
                                        ? " button--loading"
                                        : !canSave
                                            ? " button--disabled"
                                            : ""
                                }`}
                                onClick={canSave ? handleSaveReply : () => {}}
                                withIcon={true}
                                icon={<Send size={16} />}
                            >
                                {feedback.hasAdminReply ? "Mettre à jour" : "Envoyer"}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
