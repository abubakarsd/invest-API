const mongoose = require('mongoose');

const SignalSchema = new mongoose.Schema({
    pair: {
        type: String,
        required: [true, 'Please provide a trading pair (e.g., BTC/USDT)'],
        uppercase: true
    },
    type: {
        type: String,
        enum: ['Buy', 'Sell'],
        required: true
    },
    entryPrice: {
        type: Number,
        required: true
    },
    stopLoss: {
        type: Number,
        required: true
    },
    takeProfit: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Cancelled'],
        default: 'Active'
    },
    result: {
        type: Number, // Percentage gain/loss
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Signal', SignalSchema);
