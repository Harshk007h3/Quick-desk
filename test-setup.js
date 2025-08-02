const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quickdesk')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Create test user
async function createTestUser() {
    try {
        // Check if test user exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('Test user already exists');
            return existingUser;
        }

        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'user',
            status: 'active'
        });

        await user.save();
        console.log('Test user created successfully');
        return user;
    } catch (error) {
        console.error('Error creating test user:', error);
    }
}

// Create test categories
async function createTestCategories() {
    try {
        const categories = [
            { name: 'Technical Issue', description: 'Software and hardware problems' },
            { name: 'Account & Access Issue', description: 'Login and permission problems' },
            { name: 'Network & Connectivity', description: 'Internet and network issues' },
            { name: 'Billing & Payment', description: 'Payment and billing queries' },
            { name: 'HR & Admin Support', description: 'Administrative support' },
            { name: 'Academic/Student Support', description: 'Educational support' },
            { name: 'General Query', description: 'General questions and support' }
        ];

        // Get the test user for createdBy field
        const testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            console.error('Test user not found. Please run createTestUser first.');
            return;
        }

        for (const category of categories) {
            const existingCategory = await Category.findOne({ name: category.name });
            if (!existingCategory) {
                const newCategory = new Category({
                    ...category,
                    createdBy: testUser._id
                });
                await newCategory.save();
                console.log(`Category "${category.name}" created`);
            }
        }

        console.log('All test categories created successfully');
    } catch (error) {
        console.error('Error creating test categories:', error);
    }
}

// Main setup function
async function setup() {
    try {
        await createTestUser();
        await createTestCategories();
        console.log('Test setup completed successfully!');
        console.log('You can now login with: test@example.com / password123');
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setup();
}

module.exports = { createTestUser, createTestCategories }; 