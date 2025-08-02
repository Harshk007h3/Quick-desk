const express = require('express');
const router = express.Router();
const { auth, isAdmin, isAgent, isAgentOrAdmin, isActive } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Category = require('../models/Category');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Get all tickets
router.get('/', [auth, isActive], async (req, res) => {
    try {
        const filters = {};
        const { status, priority, category, search } = req.query;

        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        if (category) filters.category = category;
        if (search) {
            filters.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(filters)
            .populate('category')
            .populate('creator')
            .populate('assignedTo')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// Get ticket by ID
router.get('/:id', [auth, isActive], async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('category')
            .populate('creator')
            .populate('assignedTo')
            .populate('comments.user');

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
});

// Create new ticket
router.post('/', [auth, isActive], upload.array('attachments', 5), async (req, res) => {
    try {
        const { subject, description, category, priority } = req.body;
        const categoryObj = await Category.findById(category);

        if (!categoryObj) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const ticket = new Ticket({
            subject,
            description,
            category: categoryObj._id,
            priority,
            creator: req.user._id,
            status: 'open',
            attachments: req.files?.map(file => file.path) || []
        });

        await ticket.save();

        // Broadcast ticket creation
        const realTimeService = require('../services/realTimeService');
        await realTimeService.broadcastTicketCreated(ticket._id, 'tickets');

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// Update ticket
router.patch('/:id', [auth, isAgentOrAdmin, isActive], async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['status', 'priority', 'assignedTo'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        // Add to timeline
        const action = updates.includes('status') ? 'status changed' : 'updated';
        ticket.timeline.push({
            action,
            description: `Ticket ${action} by ${req.user.name}`,
            by: req.user._id,
            at: new Date()
        });

        // Update ticket
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        // Broadcast ticket update
        const realTimeService = require('../services/realTimeService');
        await realTimeService.broadcastTicketUpdated(updatedTicket._id, 'tickets');

        res.json(updatedTicket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Assign ticket to agent
router.patch('/:id/assign', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const agent = await User.findById(req.body.agentId);
        if (!agent || agent.role !== 'agent') {
            return res.status(400).json({ error: 'Invalid agent' });
        }

        ticket.assignedTo = agent._id;
        ticket.status = 'in-progress';
        ticket.timeline.push({
            action: 'assigned',
            description: `Ticket assigned to ${agent.name}`,
            by: req.user._id,
            at: new Date()
        });

        const updatedTicket = await ticket.save();

        // Broadcast ticket assignment
        const realTimeService = require('../services/realTimeService');
        await realTimeService.broadcastTicketAssigned(updatedTicket._id, 'tickets');

        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign ticket' });
    }
});

// Add comment to ticket
router.post('/:id/comments', [auth, isActive], upload.array('attachments', 5), async (req, res) => {
    try {
        const { content } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        const comment = {
            content,
            user: req.user._id,
            attachments: req.files?.map(file => file.path) || [],
            createdAt: new Date()
        };

        ticket.comments.push(comment);
        ticket.timeline.push({
            action: 'commented',
            description: `Comment added by ${req.user.name}`,
            by: req.user._id,
            at: new Date()
        });

        const updatedTicket = await ticket.save();

        // Broadcast comment added
        const realTimeService = require('../services/realTimeService');
        await realTimeService.broadcastCommentAdded(comment._id, 'tickets');

        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Vote on ticket
router.post('/:id/vote', [auth, isActive], async (req, res) => {
    try {
        const { type } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (type === 'upvote') {
            if (!ticket.upvotes.includes(req.user._id)) {
                ticket.upvotes.push(req.user._id);
                if (ticket.downvotes.includes(req.user._id)) {
                    ticket.downvotes = ticket.downvotes.filter(id => id.toString() !== req.user._id.toString());
                }
            } else {
                ticket.upvotes = ticket.upvotes.filter(id => id.toString() !== req.user._id.toString());
            }
        } else {
            if (!ticket.downvotes.includes(req.user._id)) {
                ticket.downvotes.push(req.user._id);
                if (ticket.upvotes.includes(req.user._id)) {
                    ticket.upvotes = ticket.upvotes.filter(id => id.toString() !== req.user._id.toString());
                }
            } else {
                ticket.downvotes = ticket.downvotes.filter(id => id.toString() !== req.user._id.toString());
            }
        }

        const updatedTicket = await ticket.save();
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to vote' });
    }
});

// Get ticket statistics
router.get('/stats', [auth, isActive], async (req, res) => {
    try {
        const stats = {
            total: await Ticket.countDocuments(),
            byStatus: await Ticket.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),
            byPriority: await Ticket.aggregate([
                {
                    $group: {
                        _id: "$priority",
                        count: { $sum: 1 }
                    }
                }
            ]),
            byCategory: await Ticket.aggregate([
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
            ])
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
