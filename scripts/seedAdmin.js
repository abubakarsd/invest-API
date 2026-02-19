require('dotenv').config({ path: '../.env' }); // Adjust path if running from scripts folder
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@invest-platform.com';
        const adminPassword = 'admin123';

        // Check if admin exists
        const user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('Admin already exists');
            if (user.role !== 'admin') {
                console.log('Updating existing user to admin role...');
                user.role = 'admin';
                await user.save();
                console.log('User role updated to admin');
            }
        } else {
            console.log('Creating new admin user...');
            await User.create({
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                profile: {
                    fullname: 'System Administrator',
                    phone: '+0000000000'
                },
                isVerified: true
            });
            console.log('Admin user created successfully');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
