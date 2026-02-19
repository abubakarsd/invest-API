const adminController = require('../controllers/admin');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testAddWallet = async () => {
    // Mock Request
    const req = {
        body: {
            name: 'Test Wallet ' + Date.now(),
            currency: 'TEST',
            chain: 'TESTNET',
            address: '0x123',
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            qrCode: ''
        }
    };

    // Mock Response
    const res = {
        status: (code) => ({
            json: (data) => console.log(`Response [${code}]:`, data)
        })
    };

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        await adminController.addSystemWallet(req, res);

        setTimeout(() => {
            console.log('Done');
            process.exit(0);
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testAddWallet();
