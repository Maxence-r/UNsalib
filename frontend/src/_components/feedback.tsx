"use client";

import { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import Button from "@/_components/button";
import { closeDrawer } from "@/_components/drawer";
import { showToast, setToastMessage } from "@/_components/toast";
import "./feedback.css";

export default function FeedbackDrawerContent() {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setToastMessage("Veuillez sélectionner une note", true);
            showToast();
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    rating,
                    comment: comment.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Mark feedback as submitted in localStorage
                localStorage.setItem("unsalib_feedback_submitted", "true");
                
                setToastMessage("Merci pour votre retour !", false);
                showToast();
                closeDrawer();
            } else {
                if (data.error === "ALREADY_SUBMITTED") {
                    setToastMessage("Vous avez déjà soumis un retour", true);
                    localStorage.setItem("unsalib_feedback_submitted", "true");
                } else {
                    setToastMessage("Erreur lors de l'envoi. Réessayez plus tard.", true);
                }
                showToast();
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setToastMessage("Erreur de connexion. Réessayez plus tard.", true);
            showToast();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="feedback-drawer">
            <div className="feedback-header">
                <h2>Comment trouvez-vous UNsalib ?</h2>
                <p>Votre avis nous aide à améliorer l&apos;application</p>
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
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={4}
                />
                <div className="character-count">
                    {comment.length}/500
                </div>
            </div>

            <div className="feedback-actions">
                <Button
                    className={isSubmitting ? "button--loading" : ""}
                    onClick={isSubmitting ? () => {} : closeDrawer}
                >
                    Plus tard
                </Button>
                <Button
                    className={isSubmitting || rating === 0 ? "button--loading" : ""}
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
