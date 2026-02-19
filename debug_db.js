const mongoose = require('mongoose');
require('dotenv').config();
const SystemWallet = require('./models/SystemWallet');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const wallets = await SystemWallet.find({});
        console.log('System Wallets:');
        wallets.forEach(w => {
            console.log(`- Name: ${w.name}, Icon: '${w.icon}', QRCode: '${w.qrCode}'`);
        });
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
