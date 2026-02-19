const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide expert name'],
        trim: true
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    winRate: {
        type: Number,
        default: 0
    },
    profitShare: {
        type: Number,
        default: 20 // Percentage
    },
    followers: {
        type: Number,
        default: 0
    },
    totalProfit: {
        type: Number,
        default: 0
    },
    minInvestment: {
        type: Number,
        default: 100
    },
    isHot: {
        type: Boolean,
        default: false
    },
    strategy: {
        type: String,
        default: 'Balanced'
    },
    status: {
        type: String,
        enum: ['active', 'hidden', 'suspended'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expert', ExpertSchema);
