const mongoose = require('mongoose');

const CopyTradingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expertId: {
        type: String, // Or ObjectId if experts are also users
        required: true
    },
    expertName: String,
    investedAmount: {
        type: Number,
        required: true
    },
    currentValue: {
        type: Number
    },
    roi: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'stopped'],
        default: 'active'
    },
    startedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CopyTrading', CopyTradingSchema);
