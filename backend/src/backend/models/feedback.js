import { Schema, model } from 'mongoose';

const FeedbackSchema = Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false,
        default: ''
    },
    userId: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true,
        default: ''
    },
    adminReply: {
        type: String,
        required: false,
        default: ''
    },
    adminRepliedAt: {
        type: Date,
        required: false,
        default: null
    },
    replySeenAt: {
        type: Date,
        required: false,
        default: null
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Feedback = model('Feedback', FeedbackSchema);
export default Feedback;
