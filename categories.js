const express = require('express');
const router = express.Router();
const { auth, isAdmin, isActive } = require('../middleware/auth');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/icons');
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

// Get all categories
router.get('/', [auth, isActive], async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('createdBy')
            .populate('updatedBy')
            .sort({ createdAt: -1 });

        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get category by ID
router.get('/:id', [auth, isActive], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('createdBy')
            .populate('updatedBy');

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// Create new category
router.post('/', [auth, isAdmin, isActive], upload.single('icon'), async (req, res) => {
    try {
        const { name, description, color } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const category = new Category({
            name,
            description,
            icon: req.file?.path,
            color: color || '#007bff',
            createdBy: req.user._id
        });

        await category.save();

        // Update category count in analytics
        const analyticsService = require('../services/analyticsService');
        await analyticsService.getCategoryAnalytics();

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category
router.patch('/:id', [auth, isAdmin, isActive], upload.single('icon'), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'description', 'color'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        // Update icon if provided
        if (req.file) {
            // Delete old icon if exists
            if (category.icon) {
                try {
                    fs.unlinkSync(category.icon);
                } catch (error) {
                    console.error('Failed to delete old icon:', error);
                }
            }
            req.body.icon = req.file.path;
        }

        category.updatedBy = req.user._id;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category
router.delete('/:id', [auth, isAdmin, isActive], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete icon if exists
        if (category.icon) {
            try {
                fs.unlinkSync(category.icon);
            } catch (error) {
                console.error('Failed to delete icon:', error);
            }
        }

        // Update tickets to default category
        const defaultCategory = await Category.findOne({ name: 'General' });
        if (defaultCategory) {
            await Ticket.updateMany(
                { category: req.params.id },
                { category: defaultCategory._id }
            );
        }

        await category.deleteOne();

        // Update category count in analytics
        const analyticsService = require('../services/analyticsService');
        await analyticsService.getCategoryAnalytics();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Get category statistics
router.get('/stats', [auth, isActive], async (req, res) => {
    try {
        const stats = {
            total: await Category.countDocuments(),
            byTicketCount: await Category.aggregate([
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
            ]),
            byStatus: await Category.aggregate([
                {
                    $lookup: {
                        from: 'tickets',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'tickets'
                    }
                },
                {
                    $unwind: "$tickets"
                },
                {
                    $group: {
                        _id: {
                            category: "$name",
                            status: "$tickets.status"
                        },
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
