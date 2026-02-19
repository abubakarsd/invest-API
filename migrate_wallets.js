require('dotenv').config();
const mongoose = require('mongoose');
const SystemWallet = require('./models/SystemWallet');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const wallets = await SystemWallet.find({});
        for (const wallet of wallets) {
            // Fix broken default
            if (!wallet.icon || wallet.icon === 'default-crypto.png') {
                wallet.icon = 'tether-usdt-logo.svg'; // Verified existing image
            }
            await wallet.save();
            console.log(`Updated wallet: ${wallet.name} -> ${wallet.icon}`);
        }
        console.log('Wallet Migration complete');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
