const CopyTrading = require('../models/CopyTrading');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Expert = require('../models/Expert');

// @desc    Get all active experts
// @route   GET /api/copy-trading/experts
// @access  Private (or Public? User needs to be logged in to copy generally, so Private is fine)
exports.getExperts = async (req, res, next) => {
    try {
        const experts = await Expert.find({ status: 'active' });
        res.status(200).json({ success: true, count: experts.length, data: experts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all active copy trading investments
// @route   GET /api/copy-trading
// @access  Private
exports.getInvestments = async (req, res, next) => {
    try {
        const investments = await CopyTrading.find({ user: req.user.id });
        res.status(200).json({ success: true, count: investments.length, data: investments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Start copying an expert
// @route   POST /api/copy-trading/start
// @access  Private
exports.startCopying = async (req, res, next) => {
    try {
        const { expertId, expertName, amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid investment amount' });
        }

        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ success: false, error: 'Insufficient funds in wallet' });
        }

        // Deduct from wallet
        wallet.balance -= parseFloat(amount);
        await wallet.save();

        // Create Investment Record
        const investment = await CopyTrading.create({
            user: req.user.id,
            expertId,
            expertName,
            investedAmount: amount,
            currentValue: amount, // Starts equal
            status: 'active'
        });

        // Create Transaction
        await Transaction.create({
            user: req.user.id,
            type: 'copy_invest',
            amount,
            status: 'completed',
            details: `Started copying ${expertName}`
        });

        res.status(200).json({ success: true, data: investment });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Stop copying an expert
// @route   PUT /api/copy-trading/stop/:id
// @access  Private
exports.stopCopying = async (req, res, next) => {
    try {
        const investment = await CopyTrading.findById(req.params.id);

        if (!investment) {
            return res.status(404).json({ success: false, error: 'Investment not found' });
        }

        // Make sure user owns investment
        if (investment.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        if (investment.status === 'stopped') {
            return res.status(400).json({ success: false, error: 'Already stopped' });
        }

        // Simulate return (mock logic: mostly return original + simplistic random change)
        const returnValue = investment.currentValue;

        // Return funds to wallet
        const wallet = await Wallet.findOne({ user: req.user.id });
        wallet.balance += returnValue;
        await wallet.save();

        // Update Investment status
        investment.status = 'stopped';
        await investment.save();

        // Create Transaction
        await Transaction.create({
            user: req.user.id,
            type: 'copy_profit', // or just 'deposit' but distinct type helps
            amount: returnValue,
            status: 'completed',
            details: `Stopped copying ${investment.expertName}`
        });

        res.status(200).json({ success: true, data: investment });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
