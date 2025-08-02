const express = require('express');
const router = express.Router();
const { auth, isAdmin, isActive, isAgent } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

// Get ticket analytics
router.get('/tickets', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getTicketAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ticket analytics' });
    }
});

// Get user analytics
router.get('/users', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getUserAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
});

// Get category analytics
router.get('/categories', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getCategoryAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category analytics' });
    }
});

// Get performance analytics
router.get('/performance', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getPerformanceAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch performance analytics' });
    }
});

// Get real-time analytics
router.get('/real-time', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getRealTimeAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch real-time analytics' });
    }
});

// Get analytics by date range
router.get('/date-range', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const analytics = await analyticsService.getAnalyticsByDateRange(start, end);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch date range analytics' });
    }
});

// Get analytics by category
router.get('/by-category', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const { categoryId } = req.query;
        
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const analytics = await analyticsService.getAnalyticsByCategory(categoryId);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category analytics' });
    }
});

// Get analytics by user
router.get('/by-user', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const analytics = await analyticsService.getAnalyticsByUser(userId);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
});

// Get analytics by priority
router.get('/by-priority', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getAnalyticsByPriority();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch priority analytics' });
    }
});

// Get analytics by status
router.get('/by-status', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getAnalyticsByStatus();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status analytics' });
    }
});

// Get analytics by response time
router.get('/response-time', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getResponseTimeAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch response time analytics' });
    }
});

// Get analytics by resolution time
router.get('/resolution-time', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getResolutionTimeAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resolution time analytics' });
    }
});

// Get analytics by agent performance
router.get('/agent-performance', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const analytics = await analyticsService.getAgentPerformanceAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agent performance analytics' });
    }
});

// Get agent-specific analytics
router.get('/agent/stats', [auth, isAgent, isActive], async (req, res) => {
    try {
        const userId = req.user._id;
        const analytics = await analyticsService.getAnalyticsByUser(userId);
        
        // Add agent-specific metrics
        const agentMetrics = await analyticsService.getAgentPerformanceMetrics(userId);
        
        res.json({
            ...analytics,
            ...agentMetrics,
            targetPerformance: 90, // Target performance score
            avgDailyResolved: 5,   // Target daily resolved tickets
            responseTimeTarget: 30, // Target response time in minutes
            resolutionTimeTarget: 120 // Target resolution time in minutes
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agent analytics' });
    }
});

// Get agent ticket history
router.get('/agent/ticket-history', [auth, isAgent, isActive], async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 10, page = 1 } = req.query;
        
        const tickets = await analyticsService.getAgentTicketHistory(userId, limit, page);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ticket history' });
    }
});

// Get agent performance trends
router.get('/agent/performance-trends', [auth, isAgent, isActive], async (req, res) => {
    try {
        const userId = req.user._id;
        const { days = 30 } = req.query;
        
        const trends = await analyticsService.getAgentPerformanceTrends(userId, days);
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch performance trends' });
    }
});

// Get agent category-wise performance
router.get('/agent/category-performance', [auth, isAgent, isActive], async (req, res) => {
    try {
        const userId = req.user._id;
        const performance = await analyticsService.getAgentCategoryPerformance(userId);
        res.json(performance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category performance' });
    }
});

// Get agent priority-wise performance
router.get('/agent/priority-performance', [auth, isAgent, isActive], async (req, res) => {
    try {
        const userId = req.user._id;
        const performance = await analyticsService.getAgentPriorityPerformance(userId);
        res.json(performance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch priority performance' });
    }
});

module.exports = router;
