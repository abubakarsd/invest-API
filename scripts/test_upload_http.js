const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testUpload = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Generate Admin Token manually
        // We need to inject this user into the DB so the `protect` middleware can find it
        // Middleware does: User.findById(decoded.id)
        // So we must create a temporary admin user or find an existing one and sign that ID.

        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error("No admin found to impersonate");
            return;
        }

        const realToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        console.log('Generated token for admin:', adminUser.email);

        // 2. Upload Wallet
        const payload = {
            name: 'Http Test Wallet',
            currency: 'HTTP',
            chain: 'TEST',
            address: '0x000',
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        };

        const config = {
            headers: {
                Authorization: `Bearer ${realToken}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true // Important for cookies
        };

        // The middleware checks req.cookies.token OR req.headers.authorization
        // Let's set the Cookie header manually if axios doesn't handle it automatically without jar
        config.headers.Cookie = `token=${realToken}`;

        console.log('Sending upload request...');
        const res = await axios.post('http://localhost:5000/api/admin/wallets', payload, config);

        console.log('Upload Response:', res.data);

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    } finally {
        mongoose.disconnect();
    }
};

testUpload();
