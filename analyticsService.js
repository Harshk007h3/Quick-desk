const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Category = require('../models/Category');

// Ticket analytics
async function getTicketAnalytics() {
    try {
        // Total tickets
        const totalTickets = await Ticket.countDocuments();

        // Tickets by status
        const ticketsByStatus = await Ticket.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Tickets by priority
        const ticketsByPriority = await Ticket.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Average response time
        const avgResponseTime = await Ticket.aggregate([
            {
                $match: {
                    status: { $ne: 'open' }
                }
            },
            {
                $project: {
                    responseTime: {
                        $divide: [
                            { $subtract: ["$metadata.lastUpdated", "$createdAt"] },
                            60000 // Convert to minutes
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    average: { $avg: "$responseTime" }
                }
            }
        ]);

        // Tickets by category
        const ticketsByCategory = await Ticket.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: "$categoryInfo"
            },
            {
                $group: {
                    _id: "$categoryInfo.name",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Tickets by agent
        const ticketsByAgent = await Ticket.aggregate([
            {
                $match: {
                    assignedTo: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'agentInfo'
                }
            },
            {
                $unwind: "$agentInfo"
            },
            {
                $group: {
                    _id: "$agentInfo.name",
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            totalTickets,
            ticketsByStatus,
            ticketsByPriority,
            avgResponseTime: avgResponseTime[0]?.average || 0,
            ticketsByCategory,
            ticketsByAgent
        };
    } catch (error) {
        throw error;
    }
}

// User analytics
async function getUserAnalytics() {
    try {
        // Total users
        const totalUsers = await User.countDocuments();

        // Users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Active users
        const activeUsers = await User.countDocuments({ status: 'active' });

        // User activity
        const userActivity = await User.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: "$updatedAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            totalUsers,
            usersByRole,
            activeUsers,
            userActivity
        };
    } catch (error) {
        throw error;
    }
}

// Category analytics
async function getCategoryAnalytics() {
    try {
        // Total categories
        const totalCategories = await Category.countDocuments();

        // Categories by ticket count
        const categoriesByTicketCount = await Category.aggregate([
            {
                $lookup: {
                    from: 'tickets',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'tickets'
                }
            },
            {
                $addFields: {
                    ticketCount: { $size: "$tickets" }
                }
            },
            {
                $sort: {
                    ticketCount: -1
                }
            }
        ]);

        // Categories by last updated
        const categoriesByLastUpdated = await Category.find()
            .sort({ 'metadata.lastUpdated': -1 })
            .limit(5);

        return {
            totalCategories,
            categoriesByTicketCount,
            categoriesByLastUpdated
        };
    } catch (error) {
        throw error;
    }
}

// Performance analytics
async function getPerformanceAnalytics() {
    try {
        // Response time distribution
        const responseTimeDistribution = await Ticket.aggregate([
            {
                $match: {
                    status: { $ne: 'open' }
                }
            },
            {
                $project: {
                    responseTime: {
                        $divide: [
                            { $subtract: ["$metadata.lastUpdated", "$createdAt"] },
                            60000 // Convert to minutes
                        ]
                    }
                }
            },
            {
                $bucket: {
                    groupBy: "$responseTime",
                    boundaries: [0, 15, 30, 60, 120, 240],
                    default: "240+",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        // Resolution time by agent
        const resolutionTimeByAgent = await Ticket.aggregate([
            {
                $match: {
                    status: 'resolved',
                    assignedTo: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'agentInfo'
                }
            },
            {
                $unwind: "$agentInfo"
            },
            {
                $group: {
                    _id: "$agentInfo.name",
                    avgResolutionTime: {
                        $avg: {
                            $divide: [
                                { $subtract: ["$metadata.lastUpdated", "$createdAt"] },
                                60000 // Convert to minutes
                            ]
                        }
                    }
                }
            }
        ]);

        return {
            responseTimeDistribution,
            resolutionTimeByAgent
        };
    } catch (error) {
        throw error;
    }
}

// Real-time analytics
async function getRealTimeAnalytics() {
    try {
        // Active sessions
        const activeSessions = await User.countDocuments({ status: 'active' });

        // New tickets in last hour
        const newTickets = await Ticket.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
        });

        // Tickets resolved in last hour
        const resolvedTickets = await Ticket.countDocuments({
            status: 'resolved',
            metadata: {
                lastUpdated: {
                    $gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                }
            }
        });

        // Active agents
        const activeAgents = await User.countDocuments({
            role: 'agent',
            status: 'active'
        });

        return {
            activeSessions,
            newTickets,
            resolvedTickets,
            activeAgents
        };
    } catch (error) {
        throw error;
    }
}

// Get analytics by date range
async function getAnalyticsByDateRange(startDate, endDate) {
    try {
        const tickets = await Ticket.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Calculate metrics
        const metrics = {
            totalTickets: tickets.length,
            resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
            avgResponseTime: calculateAvgResponseTime(tickets),
            avgResolutionTime: calculateAvgResolutionTime(tickets)
        };

        return metrics;
    } catch (error) {
        throw new Error('Failed to get analytics by date range');
    }
}

// Get priority distribution with colors
async function getPriorityDistribution() {
    try {
        const tickets = await Ticket.find({});
        
        const priorityDistribution = [
            { priority: 'low', count: 0, color: 'green' },
            { priority: 'medium', count: 0, color: 'yellow' },
            { priority: 'high', count: 0, color: 'orange' },
            { priority: 'urgent', count: 0, color: 'red' }
        ];

        tickets.forEach(ticket => {
            const priority = priorityDistribution.find(p => p.priority === ticket.priority);
            if (priority) priority.count++;
        });

        // Calculate percentages
        const total = priorityDistribution.reduce((sum, p) => sum + p.count, 0);
        priorityDistribution.forEach(p => {
            p.percentage = total > 0 ? Math.round((p.count / total) * 100) : 0;
        });

        return priorityDistribution;
    } catch (error) {
        throw new Error('Failed to get priority distribution');
    }
}

// Get analytics by user
async function getAnalyticsByUser(userId) {
    try {
        const tickets = await Ticket.find({
            $or: [
                { createdBy: userId },
                { assignedTo: userId }
            ]
        });

        const priorityDistribution = await getPriorityDistribution();

        return {
            totalTickets: tickets.length,
            resolvedToday: tickets.filter(t => 
                t.status === 'resolved' && 
                new Date(t.metadata.resolvedAt).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)
            ).length,
            avgResponseTime: calculateAvgResponseTime(tickets),
            performanceScore: calculatePerformanceScore(tickets),
            priorityDistribution
        };
    } catch (error) {
        throw new Error('Failed to get analytics by user');
    }
}

// Get agent performance analytics
async function getAgentPerformanceAnalytics() {
    try {
        const agents = await User.find({ role: 'agent' });
        const performance = [];

        for (const agent of agents) {
            const agentTickets = await Ticket.find({ assignedTo: agent._id });
            
            performance.push({
                agentName: agent.name,
                totalTickets: agentTickets.length,
                resolvedTickets: agentTickets.filter(t => t.status === 'resolved').length,
                avgResponseTime: calculateAvgResponseTime(agentTickets),
                avgResolutionTime: calculateAvgResolutionTime(agentTickets)
            });
        }

        return performance;
    } catch (error) {
        throw new Error('Failed to get agent performance analytics');
    }
}

// Get response time analytics
async function getResponseTimeAnalytics() {
    try {
        const tickets = await Ticket.find({ status: { $ne: 'open' } });
        return calculateAvgResponseTime(tickets);
    } catch (error) {
        throw new Error('Failed to get response time analytics');
    }
}

// Get resolution time analytics
async function getResolutionTimeAnalytics() {
    try {
        const tickets = await Ticket.find({ status: 'resolved' });
        return calculateAvgResolutionTime(tickets);
    } catch (error) {
        throw new Error('Failed to get resolution time analytics');
    }
}

// Helper functions
function calculateAvgResponseTime(tickets) {
    const responseTimes = tickets
        .filter(t => t.status !== 'open')
        .map(t => (t.metadata.lastUpdated - t.createdAt) / 60000); // Convert to minutes
    
    return responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length) : 0;
}

function calculateAvgResolutionTime(tickets) {
    const resolutionTimes = tickets
        .filter(t => t.status === 'resolved')
        .map(t => (t.metadata.resolvedAt - t.createdAt) / 60000); // Convert to minutes
    
    return resolutionTimes.length > 0 ? Math.round(resolutionTimes.reduce((a, b) => a + b) / resolutionTimes.length) : 0;
}

function calculatePerformanceScore(tickets) {
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const total = tickets.length;
    
    // Calculate score based on resolution rate and response time
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
    const avgResponseTime = calculateAvgResponseTime(tickets);
    
    // Normalize response time (lower is better)
    const normalizedResponseTime = Math.max(0, Math.min(100, 100 - (avgResponseTime / 60))); // Assuming 60 minutes is max acceptable time
}

module.exports = {
    getTicketAnalytics,
    getUserAnalytics,
    getCategoryAnalytics,
    getPerformanceAnalytics,
    getRealTimeAnalytics,
    getAnalyticsByDateRange,
    getPriorityDistribution,
    getAnalyticsByUser,
    getAgentPerformanceAnalytics,
    getAgentPerformanceMetrics,
    getAgentTicketHistory,
    getAgentPerformanceTrends,
    getAgentCategoryPerformance,
    getAgentPriorityPerformance,
    getResponseTimeAnalytics,
    getResolutionTimeAnalytics,
    calculateAvgResponseTime,
    calculateAvgResolutionTime,
    calculatePerformanceScore
};
