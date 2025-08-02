const express = require('express');
const router = express.Router();
const { auth, isAdmin, isAgent, isAgentOrAdmin, isActive } = require('../middleware/auth');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Category = require('../models/Category');
const analyticsService = require('../services/analyticsService');

// User dashboard
router.get('/user', auth, isActive, async (req, res) => {
    try {
        // Get user's tickets
        const tickets = await Ticket.find({ creator: req.user._id })
            .populate('category')
            .populate('assignedTo')
            .sort({ createdAt: -1 });

        // Get analytics
        const analytics = await analyticsService.getTicketAnalytics();

        res.json({
            tickets,
            analytics,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// Agent dashboard
router.get('/agent', [auth, isAgent, isActive], async (req, res) => {
    try {
        // Get assigned tickets
        const assignedTickets = await Ticket.find({ assignedTo: req.user._id })
            .populate('category')
            .populate('creator')
            .sort({ createdAt: -1 });

        // Get all tickets
        const allTickets = await Ticket.find()
            .populate('category')
            .populate('creator')
            .sort({ createdAt: -1 });

        // Get analytics
        const analytics = await analyticsService.getPerformanceAnalytics();

        res.json({
            assignedTickets,
            allTickets,
            analytics,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load agent dashboard' });
    }
});

// Admin dashboard
router.get('/admin', [auth, isAdmin, isActive], async (req, res) => {
    try {
        // Get all users
        const users = await User.find()
            .sort({ createdAt: -1 });

        // Get all categories
        const categories = await Category.find()
            .sort({ createdAt: -1 });

        // Get analytics
        const analytics = {
            tickets: await analyticsService.getTicketAnalytics(),
            users: await analyticsService.getUserAnalytics(),
            categories: await analyticsService.getCategoryAnalytics(),
            performance: await analyticsService.getPerformanceAnalytics(),
            realTime: await analyticsService.getRealTimeAnalytics()
        };

        res.json({
            users,
            categories,
            analytics,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load admin dashboard' });
    }
});

// Update user preferences
router.patch('/preferences', [auth, isActive], async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['darkMode', 'notifications'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            throw new Error('Invalid updates!');
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user status
router.patch('/status', [auth, isActive], async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['status'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            throw new Error('Invalid updates!');
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        // Broadcast status change
        const realTimeService = require('../services/realTimeService');
        await realTimeService.broadcastUserStatusChanged(user._id, user.role);

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
