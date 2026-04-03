import express from 'express';
import Feedback from '../../models/feedback.js';
import { UAParser } from 'ua-parser-js';
import { Bots } from 'ua-parser-js/extensions';
import { isBot } from 'ua-parser-js/helpers';
import { getDatesRange } from '../../utils/date.js';

const router = express.Router();

function formatFeedback(feedback) {
    const adminReply = feedback.adminReply || '';
    const hasAdminReply = adminReply.trim().length > 0;
    const adminRepliedAt = feedback.adminRepliedAt || null;
    const replySeenAt = feedback.replySeenAt || null;
    const hasUnreadReply = Boolean(
        hasAdminReply &&
        adminRepliedAt &&
        (!replySeenAt || replySeenAt < adminRepliedAt)
    );

    return {
        id: feedback._id,
        rating: feedback.rating,
        comment: feedback.comment,
        userId: feedback.userId,
        userAgent: feedback.userAgent,
        adminReply,
        adminRepliedAt,
        replySeenAt,
        hasAdminReply,
        hasUnreadReply,
        createdAt: feedback.createdAt
    };
}

// Submit feedback (public endpoint)
router.post('/submit', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        let userId = req.cookies.clientUuid;
        const userAgent = req.headers['user-agent'];

        if (!userId) {
            const crypto = await import('crypto');
            userId = crypto.randomUUID();
            res.cookie('clientUuid', userId, {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'Lax'
            });
        }

        if (!rating) {
            return res.status(400).json({ error: 'MISSING_FIELDS' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'INVALID_RATING' });
        }

        const existingFeedback = await Feedback.findOne({ userId });
        if (existingFeedback) {
            return res.status(400).json({ error: 'ALREADY_SUBMITTED' });
        }

        const newFeedback = new Feedback({
            rating: parseInt(rating, 10),
            comment: comment || '',
            userId,
            userAgent: userAgent || '',
            createdAt: new Date()
        });

        await newFeedback.save();

        return res.status(201).json({
            message: 'FEEDBACK_SUBMITTED',
            success: true,
            feedback: formatFeedback(newFeedback)
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requete a '${req.url}' (${error.message})`);
    }
});

// Get current device feedback (public endpoint)
router.get('/me', async (req, res) => {
    try {
        const userId = req.cookies.clientUuid;

        if (!userId) {
            return res.status(200).json({ feedback: null });
        }

        const feedback = await Feedback.findOne({ userId });

        return res.status(200).json({
            feedback: feedback ? formatFeedback(feedback) : null
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requete a '${req.url}' (${error.message})`);
    }
});

// Mark current device reply as seen (public endpoint)
router.post('/reply-seen', async (req, res) => {
    try {
        const userId = req.cookies.clientUuid;

        if (!userId) {
            return res.status(200).json({ success: true });
        }

        const feedback = await Feedback.findOne({ userId });

        if (!feedback || !feedback.adminReply || !feedback.adminRepliedAt) {
            return res.status(200).json({ success: true });
        }

        if (!feedback.replySeenAt || feedback.replySeenAt < feedback.adminRepliedAt) {
            feedback.replySeenAt = new Date();
            await feedback.save();
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requete a '${req.url}' (${error.message})`);
    }
});

// Get all feedbacks (admin only)
router.get('/all', async (req, res) => {
    if (!req.connected) {
        return res.redirect('/admin/auth');
    }

    try {
        const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
        const formattedFeedbacks = feedbacks.map((feedback) => formatFeedback(feedback));

        return res.status(200).json(formattedFeedbacks);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requete a '${req.url}' (${error.message})`);
    }
});

// Save an admin reply for a feedback (admin only)
router.post('/reply', async (req, res) => {
    if (!req.connected) {
        return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    try {
        const { userId, reply } = req.body;
        const trimmedReply = reply?.trim();

        if (!userId || !trimmedReply) {
            return res.status(400).json({ error: 'MISSING_FIELDS' });
        }

        const feedback = await Feedback.findOne({ userId });

        if (!feedback) {
            return res.status(404).json({ error: 'FEEDBACK_NOT_FOUND' });
        }

        const replyChanged = feedback.adminReply !== trimmedReply;
        if (replyChanged || !feedback.adminRepliedAt) {
            feedback.adminReply = trimmedReply;
            feedback.adminRepliedAt = new Date();
            if (replyChanged) {
                feedback.replySeenAt = null;
            }

            await feedback.save();
        }

        return res.status(200).json({
            message: 'REPLY_SAVED',
            success: true,
            feedback: formatFeedback(feedback)
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requete a '${req.url}' (${error.message})`);
    }
});

// Get feedback statistics (admin only)
router.get('/stats', async (req, res) => {
    if (!req.connected) {
        return res.redirect('/admin/auth');
    }

    try {
        const feedbacks = await Feedback.find({});
        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(2) : 0;

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbacks.forEach((feedback) => {
            distribution[feedback.rating]++;
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentFeedbacks = feedbacks.filter((feedback) => new Date(feedback.createdAt) >= thirtyDaysAgo);
        const dateRange = getDatesRange(thirtyDaysAgo, new Date());
        const trendsData = {};

        dateRange.forEach((date) => {
            trendsData[date] = {
                count: 0,
                totalRating: 0,
                average: 0
            };
        });

        recentFeedbacks.forEach((feedback) => {
            const dateKey = feedback.createdAt.toISOString().split('T')[0];
            if (trendsData[dateKey]) {
                trendsData[dateKey].count++;
                trendsData[dateKey].totalRating += feedback.rating;
            }
        });

        Object.keys(trendsData).forEach((date) => {
            if (trendsData[date].count > 0) {
                trendsData[date].average = (trendsData[date].totalRating / trendsData[date].count).toFixed(2);
            }
        });

        const platforms = {};
        feedbacks.forEach((feedback) => {
            const parsedUserAgent = new UAParser({ Bots });
            parsedUserAgent.setUA(feedback.userAgent);

            let osName = 'Bot';
            if (!isBot(parsedUserAgent.getResult())) {
                osName = !parsedUserAgent.getOS().name ? 'Inconnu' : parsedUserAgent.getOS().name;
            }

            platforms[osName] = platforms[osName] || { count: 0, totalRating: 0, average: 0 };
            platforms[osName].count++;
            platforms[osName].totalRating += feedback.rating;
        });

        Object.keys(platforms).forEach((platform) => {
            platforms[platform].average = (platforms[platform].totalRating / platforms[platform].count).toFixed(2);
        });

        return res.status(200).json({
            totalFeedbacks: feedbacks.length,
            averageRating: parseFloat(averageRating),
            distribution,
            trends: trendsData,
            platforms
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requete a '${req.url}' (${error.message})`);
    }
});

export default router;
