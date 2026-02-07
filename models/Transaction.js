const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdraw', 'buy', 'sell', 'copy_invest', 'copy_profit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    asset: {
        symbol: String,
        name: String,
        quantity: Number,
        price: Number
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    details: {
        type: String // Optional description or ID reference
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
