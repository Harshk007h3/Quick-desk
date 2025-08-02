const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Upvote a ticket
async function upvoteTicket(ticketId, userId) {
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Check if user already voted
        if (ticket.upvotes.includes(userId)) {
            // Remove upvote
            ticket.upvotes = ticket.upvotes.filter(id => id.toString() !== userId.toString());
        } else {
            // Add upvote and remove downvote if exists
            ticket.upvotes.push(userId);
            ticket.downvotes = ticket.downvotes.filter(id => id.toString() !== userId.toString());
        }

        await ticket.save();
        return ticket;
    } catch (error) {
        throw error;
    }
}

// Downvote a ticket
async function downvoteTicket(ticketId, userId) {
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Check if user already voted
        if (ticket.downvotes.includes(userId)) {
            // Remove downvote
            ticket.downvotes = ticket.downvotes.filter(id => id.toString() !== userId.toString());
        } else {
            // Add downvote and remove upvote if exists
            ticket.downvotes.push(userId);
            ticket.upvotes = ticket.upvotes.filter(id => id.toString() !== userId.toString());
        }

        await ticket.save();
        return ticket;
    } catch (error) {
        throw error;
    }
}

// Upvote a comment
async function upvoteComment(commentId, userId) {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        // Check if user already voted
        if (comment.upvotes.includes(userId)) {
            // Remove upvote
            comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
        } else {
            // Add upvote and remove downvote if exists
            comment.upvotes.push(userId);
            comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
        }

        await comment.save();
        return comment;
    } catch (error) {
        throw error;
    }
}

// Downvote a comment
async function downvoteComment(commentId, userId) {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        // Check if user already voted
        if (comment.downvotes.includes(userId)) {
            // Remove downvote
            comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
        } else {
            // Add downvote and remove upvote if exists
            comment.downvotes.push(userId);
            comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
        }

        await comment.save();
        return comment;
    } catch (error) {
        throw error;
    }
}

// Get user's voting history
async function getUserVotingHistory(userId) {
    try {
        const [tickets, comments] = await Promise.all([
            Ticket.find({
                $or: [
                    { upvotes: userId },
                    { downvotes: userId }
                ]
            }).select('upvotes downvotes'),
            Comment.find({
                $or: [
                    { upvotes: userId },
                    { downvotes: userId }
                ]
            }).select('upvotes downvotes')
        ]);

        return {
            tickets,
            comments
        };
    } catch (error) {
        throw error;
    }
}

// Get most upvoted items
async function getMostUpvoted(limit = 10) {
    try {
        const [tickets, comments] = await Promise.all([
            Ticket.aggregate([
                {
                    $project: {
                        _id: 1,
                        subject: 1,
                        upvotesCount: { $size: "$upvotes" },
                        downvotesCount: { $size: "$downvotes" }
                    }
                },
                {
                    $sort: { upvotesCount: -1 }
                },
                {
                    $limit: limit
                }
            ]),
            Comment.aggregate([
                {
                    $project: {
                        _id: 1,
                        content: 1,
                        upvotesCount: { $size: "$upvotes" },
                        downvotesCount: { $size: "$downvotes" }
                    }
                },
                {
                    $sort: { upvotesCount: -1 }
                },
                {
                    $limit: limit
                }
            ])
        ]);

        return {
            tickets,
            comments
        };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    upvoteTicket,
    downvoteTicket,
    upvoteComment,
    downvoteComment,
    getUserVotingHistory,
    getMostUpvoted
};
