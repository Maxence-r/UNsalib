import express from 'express';
import Feedback from '../../models/feedback.js';
import { UAParser } from 'ua-parser-js';
import { Bots } from 'ua-parser-js/extensions';
import { isBot } from 'ua-parser-js/helpers';
import { getDatesRange } from '../../utils/date.js';

const router = express.Router();

// Submit feedback (public endpoint)
router.post('/submit', async (req, res) => {
    try {
        // Retrieving body parameters
        const { rating, comment } = req.body;
        let userId = req.cookies.clientUuid;
        const userAgent = req.headers['user-agent'];

        // If no userId cookie exists, generate one (for testing purposes)
        if (!userId) {
            const crypto = await import('crypto');
            userId = crypto.randomUUID();
            // Set the cookie for future requests
            res.cookie('clientUuid', userId, { 
                maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
                httpOnly: true,
                sameSite: 'Lax'
            });
        }

        // Validation
        if (!rating) {
            return res.status(400).json({ error: 'MISSING_FIELDS' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'INVALID_RATING' });
        }

        // Check if user already submitted feedback
        const existingFeedback = await Feedback.findOne({ userId });
        if (existingFeedback) {
            return res.status(400).json({ error: 'ALREADY_SUBMITTED' });
        }

        // Create new feedback
        const newFeedback = new Feedback({
            rating: parseInt(rating, 10),
            comment: comment || '',
            userId,
            userAgent: userAgent || '',
            createdAt: new Date()
        });

        await newFeedback.save();

        res.status(201).json({ message: 'FEEDBACK_SUBMITTED', success: true });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

// Get all feedbacks (admin only)
router.get('/all', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    try {
        const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });

        // Format response
        const formattedFeedbacks = feedbacks.map((feedback) => ({
            id: feedback._id,
            rating: feedback.rating,
            comment: feedback.comment,
            userId: feedback.userId,
            userAgent: feedback.userAgent,
            createdAt: feedback.createdAt
        }));

        res.status(200).json(formattedFeedbacks);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

// Get feedback statistics (admin only)
router.get('/stats', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    try {
        const feedbacks = await Feedback.find({});

        // Calculate average rating
        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(2) : 0;

        // Calculate distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbacks.forEach((feedback) => {
            distribution[feedback.rating]++;
        });

        // Time-based trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentFeedbacks = feedbacks.filter(f => new Date(f.createdAt) >= thirtyDaysAgo);
        
        // Group by date
        const dateRange = getDatesRange(thirtyDaysAgo, new Date());
        const trendsData = {};
        
        dateRange.forEach(date => {
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

        // Calculate averages for each day
        Object.keys(trendsData).forEach(date => {
            if (trendsData[date].count > 0) {
                trendsData[date].average = (trendsData[date].totalRating / trendsData[date].count).toFixed(2);
            }
        });

        // Platform analysis
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

        // Calculate platform averages
        Object.keys(platforms).forEach(platform => {
            platforms[platform].average = (platforms[platform].totalRating / platforms[platform].count).toFixed(2);
        });

        res.status(200).json({
            totalFeedbacks: feedbacks.length,
            averageRating: parseFloat(averageRating),
            distribution,
            trends: trendsData,
            platforms
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

export default router;
