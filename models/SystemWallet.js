const mongoose = require('mongoose');

const SystemWalletSchema = new mongoose.Schema({
    currency: {
        type: String,
        required: [true, 'Please provide a currency symbol'],
        enum: ['BTC', 'ETH', 'USDT', 'LTC', 'XRP', 'DOGE', 'BNB'],
        uppercase: true
    },
    chain: {
        type: String,
        required: [true, 'Please provide the blockchain network']
    },
    address: {
        type: String,
        required: [true, 'Please provide the wallet address']
    },
    qrCode: {
        type: String, // URL to the image
        default: null
    },
    label: {
        type: String, // e.g., "Main BTC Wallet"
        default: 'System Wallet'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SystemWallet', SystemWalletSchema);
