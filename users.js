const express = require('express');
const router = express.Router();
const { auth, isAdmin, isAgentOrAdmin, isActive } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
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

// Get all users (admin only)
router.get('/', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID
router.get('/:id', [auth, isActive], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile
router.patch('/profile', [auth, isActive], upload.single('profilePicture'), async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'preferences'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        // Update profile picture if provided
        if (req.file) {
            // Delete old profile picture if exists
            if (req.user.profilePicture) {
                try {
                    fs.unlinkSync(req.user.profilePicture);
                } catch (error) {
                    console.error('Failed to delete old profile picture:', error);
                }
            }
            req.body.profilePicture = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update user status
router.patch('/:id/status', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { status } = req.body;
        user.status = status;
        await user.save();

        // Broadcast status change
        const realTimeService = require('../services/realTimeService');
        await realTimeService.broadcastUserStatusChanged(user._id, user.role);

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Update user role (admin only)
router.patch('/:id/role', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { role } = req.body;
        if (!['user', 'agent', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        user.role = role;
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Get user statistics
router.get('/stats', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const stats = {
            total: await User.countDocuments(),
            byRole: await User.aggregate([
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 }
                    }
                }
            ]),
            byStatus: await User.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),
            activeUsers: await User.countDocuments({ status: 'active' }),
            inactiveUsers: await User.countDocuments({ status: 'inactive' })
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get user activity
router.get('/activity', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const activity = await User.aggregate([
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
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ]);

        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

module.exports = router;
