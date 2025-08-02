const express = require('express');
const router = express.Router();
const { auth, isAgent, isActive } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

// Get agent-specific analytics
router.get('/stats', [auth, isAgent, isActive], async (req, res) => {
    try {
        const agentId = req.user._id;
        
        // Get agent's assigned tickets
        const assignedTickets = await analyticsService.getAnalyticsByUser(agentId);
        
        // Get agent's performance metrics
        const performance = await analyticsService.getAgentPerformanceAnalytics();
        
        // Get agent's response time metrics
        const responseTime = await analyticsService.getResponseTimeAnalytics();
        
        // Get agent's resolution time metrics
        const resolutionTime = await analyticsService.getResolutionTimeAnalytics();
        
        res.json({
            assignedTickets,
            performance,
            responseTime,
            resolutionTime
        });
    } catch (error) {
        console.error('Failed to get agent analytics:', error);
        res.status(500).json({ error: 'Failed to fetch agent analytics' });
    }
});

// Get agent's ticket history
router.get('/ticket-history', [auth, isAgent, isActive], async (req, res) => {
    try {
        const agentId = req.user._id;
        
        const tickets = await analyticsService.getAnalyticsByUser(agentId);
        
        res.json(tickets);
    } catch (error) {
        console.error('Failed to get ticket history:', error);
        res.status(500).json({ error: 'Failed to fetch ticket history' });
    }
});

// Get agent's performance trend
router.get('/performance-trend', [auth, isAgent, isActive], async (req, res) => {
    try {
        const agentId = req.user._id;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        const performance = await analyticsService.getAnalyticsByDateRange(
            new Date(startDate),
            new Date(endDate)
        );

        res.json(performance);
    } catch (error) {
        console.error('Failed to get performance trend:', error);
        res.status(500).json({ error: 'Failed to fetch performance trend' });
    }
});

// Get agent's category-wise performance
router.get('/category-performance', [auth, isAgent, isActive], async (req, res) => {
    try {
        const agentId = req.user._id;
        
        const tickets = await analyticsService.getAnalyticsByUser(agentId);
        
        const categoryPerformance = await analyticsService.getCategoryAnalytics();
        
        res.json({
            tickets,
            categoryPerformance
        });
    } catch (error) {
        console.error('Failed to get category performance:', error);
        res.status(500).json({ error: 'Failed to fetch category performance' });
    }
});

// Get agent's priority-wise performance
router.get('/priority-performance', [auth, isAgent, isActive], async (req, res) => {
    try {
        const agentId = req.user._id;
        
        const tickets = await analyticsService.getAnalyticsByUser(agentId);
        
        const priorityPerformance = await analyticsService.getAnalyticsByPriority();
        
        res.json({
            tickets,
            priorityPerformance
        });
    } catch (error) {
        console.error('Failed to get priority performance:', error);
        res.status(500).json({ error: 'Failed to fetch priority performance' });
    }
});

module.exports = router;
