"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Send, Star } from "lucide-react";

import Button from "@/_components/button";
import { closeDrawer } from "@/_components/drawer";
import { ApiFeedback } from "@/_utils/api-types";
import {
    fetchCurrentFeedback,
    hasUnreadFeedbackReply,
    markFeedbackReplyAsSeen,
    submitFeedback,
} from "@/_utils/feedback";
import { showToast, setToastMessage } from "@/_components/toast";
import "./feedback.css";

function renderStars(rating: number, size: number) {
    return Array.from({ length: 5 }, (_, index) => (
        <Star
            key={index}
            size={size}
            fill={index < rating ? "currentColor" : "none"}
        />
    ));
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function FeedbackConversation({
    feedback,
}: {
    feedback: ApiFeedback;
}) {
    const hasAdminReply = feedback.adminReply.trim().length > 0;
    const userMessage = feedback.comment.trim().length > 0
        ? feedback.comment
        : `Vous nous avez attribué la note de ${feedback.rating}/5.`;

    return (
        <div className="feedback-drawer feedback-drawer--conversation">
            <div className="feedback-header">
                <h2>
                    {hasAdminReply ? "Nous vous avons répondu" : "Votre retour a bien été reçu"}
                </h2>
                <p>
                    {hasAdminReply
                        ? "Voici votre message et la réponse de notre équipe."
                        : "Merci pour votre retour. Nous l'avons bien enregistré."}
                </p>
            </div>

            <div className="feedback-thread">
                <div className="feedback-thread-item">
                    <div className="feedback-thread-heading">
                        <span className="feedback-thread-label">Votre retour</span>
                        <span className="feedback-thread-date">{formatDate(feedback.createdAt)}</span>
                    </div>
                    <div className="feedback-thread-rating">
                        {renderStars(feedback.rating, 18)}
                        <span>{feedback.rating}/5</span>
                    </div>
                    <div className="feedback-thread-bubble">
                        <p>{userMessage}</p>
                    </div>
                </div>

                {hasAdminReply && (
                    <div className="feedback-thread-item">
                        <div className="feedback-thread-heading">
                            <span className="feedback-thread-label">Notre réponse</span>
                            {feedback.adminRepliedAt && (
                                <span className="feedback-thread-date">
                                    {formatDate(feedback.adminRepliedAt)}
                                </span>
                            )}
                        </div>
                        <div className="feedback-thread-bubble feedback-thread-bubble--admin">
                            <p>{feedback.adminReply}</p>
                        </div>
                    </div>
                )}
            </div>

            {hasAdminReply && (
                <div className="feedback-email-note">
                    <Mail size={18} />
                    <p>
                        Si vous souhaitez continuer la conversation, envoyez-nous un e-mail à{" "}
                        <a href="mailto:contact@unsalib.info">contact@unsalib.info</a>.
                    </p>
                </div>
            )}

            <div className="feedback-actions">
                <Button className="feedback-button feedback-button--primary" onClick={closeDrawer}>
                    Fermer
                </Button>
            </div>
        </div>
    );
}

export default function FeedbackDrawerContent({
    initialFeedback,
    markReplyAsSeenOnMount = false,
}: {
    initialFeedback?: ApiFeedback | null;
    markReplyAsSeenOnMount?: boolean;
}) {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(initialFeedback === undefined);
    const [currentFeedback, setCurrentFeedback] = useState<ApiFeedback | null | undefined>(initialFeedback);

    useEffect(() => {
        setCurrentFeedback(initialFeedback);
        setIsLoadingFeedback(initialFeedback === undefined);
    }, [initialFeedback]);

    useEffect(() => {
        if (initialFeedback !== undefined) {
            return;
        }

        let cancelled = false;

        const loadFeedback = async () => {
            try {
                const feedback = await fetchCurrentFeedback();
                if (!cancelled) {
                    setCurrentFeedback(feedback);
                }
            } catch (error) {
                console.error("Error loading feedback conversation:", error);
                if (!cancelled) {
                    setCurrentFeedback(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingFeedback(false);
                }
            }
        };

        void loadFeedback();

        return () => {
            cancelled = true;
        };
    }, [initialFeedback]);

    useEffect(() => {
        if (!markReplyAsSeenOnMount || !currentFeedback || !hasUnreadFeedbackReply(currentFeedback)) {
            return;
        }

        let cancelled = false;

        const acknowledgeReply = async () => {
            try {
                await markFeedbackReplyAsSeen();
                if (!cancelled) {
                    setCurrentFeedback((previousFeedback) =>
                        previousFeedback
                            ? {
                                ...previousFeedback,
                                hasUnreadReply: false,
                                replySeenAt: new Date().toISOString(),
                            }
                            : previousFeedback,
                    );
                }
            } catch (error) {
                console.error("Error acknowledging feedback reply:", error);
            }
        };

        void acknowledgeReply();

        return () => {
            cancelled = true;
        };
    }, [currentFeedback, markReplyAsSeenOnMount]);

    const handleSubmit = async () => {
        if (rating === 0) {
            setToastMessage("Veuillez sélectionner une note.", true);
            showToast();
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitFeedback({
                rating,
                comment: comment.trim(),
            });

            if (result.success) {
                setCurrentFeedback(result.feedback ?? null);
                setToastMessage("Merci pour votre retour !", false);
                showToast();
                closeDrawer();
                return;
            }

            if (result.error === "ALREADY_SUBMITTED") {
                const existingFeedback = await fetchCurrentFeedback().catch(() => null);
                if (existingFeedback) {
                    setCurrentFeedback(existingFeedback);
                }
                setToastMessage("Vous avez déjà soumis un retour.", true);
            } else {
                setToastMessage("Erreur lors de l'envoi. Réessayez plus tard.", true);
            }
            showToast();
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setToastMessage("Erreur de connexion. Réessayez plus tard.", true);
            showToast();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingFeedback) {
        return (
            <div className="feedback-drawer feedback-drawer--state">
                <p className="feedback-state-text">Chargement de la conversation...</p>
            </div>
        );
    }

    if (currentFeedback) {
        return <FeedbackConversation feedback={currentFeedback} />;
    }

    return (
        <div className="feedback-drawer">
            <div className="feedback-header">
                <h2>Comment trouvez-vous UNsalib ?</h2>
                <p>Votre avis nous aide à améliorer l&apos;application.</p>
            </div>

            <div className="feedback-rating">
                <div className="stars-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`star-button ${
                                star <= (hoveredRating || rating) ? "active" : ""
                            }`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                        >
                            <Star
                                size={40}
                                fill={
                                    star <= (hoveredRating || rating)
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="rating-text">
                        {rating === 1 && "Très mauvais"}
                        {rating === 2 && "Mauvais"}
                        {rating === 3 && "Moyen"}
                        {rating === 4 && "Bon"}
                        {rating === 5 && "Excellent"}
                    </p>
                )}
            </div>

            <div className="feedback-comment">
                <label htmlFor="feedback-comment-input">
                    <MessageSquare size={20} />
                    <span>Des suggestions ou améliorations ? (optionnel)</span>
                </label>
                <textarea
                    id="feedback-comment-input"
                    placeholder="Partagez vos idées avec nous..."
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={500}
                    rows={4}
                />
                <div className="character-count">
                    {comment.length}/500
                </div>
            </div>

            <div className="feedback-actions">
                <Button
                    className={`feedback-button feedback-button--secondary${isSubmitting ? " button--disabled" : ""}`}
                    onClick={isSubmitting ? () => {} : closeDrawer}
                >
                    Plus tard
                </Button>
                <Button
                    className={`feedback-button feedback-button--primary${
                        isSubmitting
                            ? " button--loading"
                            : rating === 0
                                ? " button--disabled"
                                : ""
                    }`}
                    onClick={rating === 0 || isSubmitting ? () => {} : handleSubmit}
                    withIcon={true}
                    icon={<Send size={18} />}
                    >
                    Envoyer
                </Button>
            </div>
        </div>
    );
}
