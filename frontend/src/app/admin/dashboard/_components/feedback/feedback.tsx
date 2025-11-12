"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/_components/card";
import { PieChart } from "@/_components/chart";
// @ts-expect-error: CSS module side-effect import
import "./feedback.css";
import {
    getFeedbackStats,
    getAllFeedbacks,
} from "../../_utils/client-actions";

interface FeedbackStats {
    totalFeedbacks: number;
    averageRating: number;
    distribution: { [key: number]: number };
    trends: {
        [date: string]: {
            count: number;
            totalRating: number;
            average: string;
        };
    };
    platforms: {
        [platform: string]: {
            count: number;
            totalRating: number;
            average: string;
        };
    };
}

interface Feedback {
    id: string;
    rating: number;
    comment: string;
    userId: string;
    userAgent: string;
    createdAt: string;
}

export default function FeedbackPage() {
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [statsData, feedbacksData] = await Promise.all([
                    getFeedbackStats(),
                    getAllFeedbacks(),
                ]);
                setStats(statsData);
                setFeedbacks(feedbacksData);
            } catch (e) {
                console.error("Error fetching feedback data:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                fill={i < rating ? "#FFB800" : "none"}
                color={i < rating ? "#FFB800" : "#ccc"}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="main dashboard-feedback">
            <div className="view">
                <h2 className="view-title">Retours utilisateurs</h2>
                <div className="view-content">
                    {/* Overview Section */}
                    <div className="section">
                        <h4 className="section-title">Vue d&apos;ensemble</h4>
                        <div className="section-content">
                            <div className="feedback-overview">
                                <Card isLoading={isLoading}>
                                    <CardHeader>Note moyenne</CardHeader>
                                    <CardContent>
                                        <div className="rating-display">
                                            <h1>{stats?.averageRating.toFixed(1) || "-"}</h1>
                                            <div className="stars">
                                                {stats && renderStars(Math.round(stats.averageRating))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card isLoading={isLoading}>
                                    <CardHeader>Total des retours</CardHeader>
                                    <CardContent>
                                        <div className="stat-display">
                                            <Users size={32} />
                                            <h1>{stats?.totalFeedbacks || "-"}</h1>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Distribution Section */}
                    <div className="section">
                        <h4 className="section-title">Distribution des notes</h4>
                        <div className="section-content">
                            <Card isLoading={isLoading}>
                                <CardContent>
                                    {stats && (
                                        <div className="distribution-chart">
                                            <PieChart
                                                dataset={Object.entries(stats.distribution)
                                                    .map(([rating, count]) => ({
                                                        legend: `${rating} étoile${parseInt(rating) > 1 ? "s" : ""}`,
                                                        value: count,
                                                    }))
                                                    .filter((item) => item.value > 0)}
                                                sortDataset="desc"
                                                chartId="feedback-distribution"
                                            />
                                            <div className="distribution-bars">
                                                {[5, 4, 3, 2, 1].map((rating) => (
                                                    <div key={rating} className="bar-row">
                                                        <span className="bar-label">{rating}★</span>
                                                        <div className="bar-container">
                                                            <div
                                                                className="bar-fill"
                                                                style={{
                                                                    width: stats.totalFeedbacks > 0
                                                                        ? `${(stats.distribution[rating] / stats.totalFeedbacks) * 100}%`
                                                                        : "0%",
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="bar-count">
                                                            {stats.distribution[rating] || 0}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Platform Analysis */}
                    <div className="section">
                        <h4 className="section-title">Analyse par plateforme</h4>
                        <div className="section-content">
                            <Card isLoading={isLoading}>
                                <CardContent>
                                    {stats && stats.platforms && Object.keys(stats.platforms).length > 0 ? (
                                        <div className="platform-list">
                                            {Object.entries(stats.platforms).map(
                                                ([platform, data]) => (
                                                    <div key={platform} className="platform-item">
                                                        <div className="platform-info">
                                                            <span className="platform-name">
                                                                {platform}
                                                            </span>
                                                            <span className="platform-count">
                                                                {data.count} retour{data.count > 1 ? "s" : ""}
                                                            </span>
                                                        </div>
                                                        <div className="platform-rating">
                                                            {renderStars(Math.round(parseFloat(data.average)))}
                                                            <span>{parseFloat(data.average).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p>Aucune donnée disponible</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Trends Section */}
                    <div className="section">
                        <h4 className="section-title">
                            <TrendingUp size={20} />
                            Tendances (30 derniers jours)
                        </h4>
                        <div className="section-content">
                            <Card isLoading={isLoading}>
                                <CardContent>
                                    {stats && stats.trends && (
                                        <div className="trends-chart">
                                            {Object.entries(stats.trends)
                                                .filter(([, data]) => data.count > 0)
                                                .slice(-14) // Show last 14 days with data
                                                .map(([date, data]) => (
                                                    <div key={date} className="trend-item">
                                                        <span className="trend-date">
                                                            {new Date(date).toLocaleDateString("fr-FR", {
                                                                day: "2-digit",
                                                                month: "short",
                                                            })}
                                                        </span>
                                                        <div className="trend-bar">
                                                            <div
                                                                className="trend-fill"
                                                                style={{
                                                                    width: `${(parseFloat(data.average) / 5) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="trend-value">
                                                            {parseFloat(data.average).toFixed(1)}★ ({data.count})
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="section">
                        <h4 className="section-title">
                            <MessageSquare size={20} />
                            Commentaires récents
                        </h4>
                        <div className="section-content">
                            <div className="comments-list">
                                {isLoading ? (
                                    <Card isLoading={true}>
                                        <CardContent>Chargement...</CardContent>
                                    </Card>
                                ) : feedbacks.filter((f) => f.comment).length > 0 ? (
                                    feedbacks
                                        .filter((f) => f.comment)
                                        .map((feedback) => (
                                            <Card key={feedback.id}>
                                                <CardContent>
                                                    <div className="comment-item">
                                                        <div className="comment-header">
                                                            <div className="comment-rating">
                                                                {renderStars(feedback.rating)}
                                                            </div>
                                                            <span className="comment-date">
                                                                {formatDate(feedback.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="comment-text">
                                                            {feedback.comment}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                ) : (
                                    <Card>
                                        <CardContent>
                                            <p>Aucun commentaire pour le moment</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
