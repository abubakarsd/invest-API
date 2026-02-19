const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    user: {
        type: String, // Storing as String for Manual Entry flexibility (or could be ObjectId if strict)
        // For manual trades, admin might just type a name. But ideally, it should link to a user.
        // Let's make it flexible: if it looks like an ID, link it?
        // Actually, for "Add Manual Trade", the admin probably wants to simulate a trade for a SPECIFIC user.
        // But the mock data showed user names.
        // Let's stick to simple String for "User Name" for now to match mock data simplicity,
        // or better, try to link to User model if possible.
        // Given the requirement "Add Manual Trade", let's use a String for "User Name" to be safe and simple
        // as the admin might want to display a fake user or a real one.
        // Wait, if it's "Global Trade History", it should reflect REAL users' trades.
        // But "Add Manual Trade" implies admin injecting data.
        // Let's use `user` as a String for the name, but maybe add `userId` as optional ref.
        required: [true, 'Please provide a user name']
    },
    type: {
        type: String,
        enum: ['Buy', 'Sell', 'Copy'],
        required: true
    },
    asset: {
        type: String,
        required: true
    },
    amount: {
        type: String, // Keeping as string to allow formatting like "$5,000"
        required: true
    },
    pnl: {
        type: String, // "+$120.50"
        default: '$0.00'
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trade', TradeSchema);
