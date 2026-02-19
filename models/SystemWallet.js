const mongoose = require('mongoose');

const SystemWalletSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a wallet name']
    },
    currency: {
        type: String,
        required: [true, 'Please provide a currency symbol'],
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
        type: String, // Base64 or URL
        default: null
    },
    icon: {
        type: String, // Image filename
        default: 'default-crypto.png'
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
