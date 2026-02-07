const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const User = require('../models/User');
        const collection = User.collection;

        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        const usernameIndex = indexes.find(idx => idx.name === 'username_1');

        if (usernameIndex) {
            console.log('Found username index. Dropping...');
            await collection.dropIndex('username_1');
            console.log('Username index dropped successfully.');
        } else {
            console.log('Username index not found.');
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixIndexes();
