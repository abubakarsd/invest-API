require('dotenv').config(); // Load .env from current directory (backend)
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
            // Always update password and role to ensure access
            user.role = 'admin';
            user.password = adminPassword; // Triggers pre-save hash? No, direct assignment might not if not saving correctly.
            // Actually, in Mongoose, assigning to field and saving triggers pre-save if modified.
            // But we need to ensure 'password' is marked modified.
            // Let's use user.password = ... and user.save()
            user.password = adminPassword;
            await user.save();
            console.log('Admin credentials updated');
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
