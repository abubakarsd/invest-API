const mongoose = require('mongoose');
const SystemWallet = require('../models/SystemWallet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkWallets = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const wallets = await SystemWallet.find({});
        console.log('--- System Wallets ---');
        wallets.forEach(w => {
            console.log(`Name: ${w.name}, Icon: ${w.icon}`);
        });
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkWallets();
