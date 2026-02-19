const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const SystemWallet = require('../models/SystemWallet');

// @desc    Get all system wallets (deposit methods)
// @route   GET /api/wallet/system-wallets
// @access  Private
exports.getSystemWallets = async (req, res, next) => {
    try {
        const wallets = await SystemWallet.find();
        res.status(200).json({ success: true, count: wallets.length, data: wallets });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res, next) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet) {
            // Create wallet if not exists
            wallet = await Wallet.create({ user: req.user.id });
        }

        res.status(200).json({ success: true, data: wallet });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Deposit funds (Mock)
// @route   POST /api/wallet/deposit
// @access  Private
exports.deposit = async (req, res, next) => {
    try {
        const { amount, method } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid amount' });
        }

        let wallet = await Wallet.findOne({ user: req.user.id });
        if (!wallet) {
            wallet = await Wallet.create({ user: req.user.id });
        }

        // Update balance
        wallet.balance += parseFloat(amount);
        await wallet.save();

        // Create Transaction Record
        await Transaction.create({
            user: req.user.id,
            type: 'deposit',
            amount,
            status: 'completed',
            details: `Deposit via ${method || 'Standard Method'}`
        });

        res.status(200).json({ success: true, data: wallet });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Withdraw funds (Mock)
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdraw = async (req, res, next) => {
    try {
        const { amount, address, network } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid amount' });
        }

        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ success: false, error: 'Insufficient funds' });
        }

        // Deduct balance
        wallet.balance -= parseFloat(amount);
        await wallet.save();

        // Create Transaction Record
        await Transaction.create({
            user: req.user.id,
            type: 'withdraw',
            amount,
            status: 'pending', // Withdrawals usually pending
            details: `Withdraw to ${address} (${network})`
        });

        res.status(200).json({ success: true, data: wallet });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSystemWallets = exports.getSystemWallets;
