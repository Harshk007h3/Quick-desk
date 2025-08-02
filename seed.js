const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Default credentials
const defaultUsers = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
        status: 'active'
    },
    {
        name: 'Agent User',
        email: 'agent@example.com',
        password: 'Agent@123',
        role: 'agent',
        status: 'active'
    },
    {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'User@123',
        role: 'user',
        status: 'active'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Hash passwords and create users
        for (const userData of defaultUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                ...userData,
                password: hashedPassword
            });
            await user.save();
            console.log(`Created user: ${userData.email}`);
        }

        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
