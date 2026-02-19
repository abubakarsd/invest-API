const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const SystemWallet = require('../models/SystemWallet');
const Expert = require('../models/Expert');
const Signal = require('../models/Signal');
const Trade = require('../models/Trade');
const fs = require('fs');
const path = require('path');

// Helper to save Base64 image
const saveBase64Image = (base64String, prefix) => {
    if (!base64String || !base64String.startsWith('data:image')) return base64String;

    const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return base64String;

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Path to React App's public assets (Local Development Setup)
    // process.cwd() is the root of where node was started (backend folder)
    const uploadDir = path.join(process.cwd(), '../react-app/public/assets/dashboard/images');

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${prefix}-${Date.now()}.${ext}`;
    const fullPath = path.join(uploadDir, filename);

    fs.writeFileSync(fullPath, buffer);

    return filename;
};

// @desc    Admin Login
// @route   POST /api/admin/auth/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user and select password
        const user = await User.findOne({ email }).select('+password');

        if (!user || user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const pendingDeposits = await Transaction.countDocuments({ type: 'deposit', status: 'pending' });
        const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdraw', status: 'pending' });
        const totalExperts = await Expert.countDocuments({ status: 'active' });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                pendingDeposits,
                pendingWithdrawals,
                totalExperts
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- SYSTEM WALLETS ---

exports.getSystemWallets = async (req, res) => {
    try {
        const wallets = await SystemWallet.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: wallets.length, data: wallets });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addSystemWallet = async (req, res) => {
    try {
        const { name, currency, chain, address } = req.body;
        let icon = 'default-crypto.png';
        let qrCode = null;

        if (req.files) {
            if (req.files.icon) {
                icon = req.files.icon[0].filename;
            }
            if (req.files.qrCode) {
                qrCode = req.files.qrCode[0].filename;
            }
        }

        const wallet = await SystemWallet.create({
            name,
            currency,
            chain,
            address,
            icon,
            qrCode
        });

        res.status(201).json({ success: true, data: wallet });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteSystemWallet = async (req, res) => {
    try {
        await SystemWallet.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- USER MANAGEMENT ---

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- FINANCIALS ---

exports.getDeposits = async (req, res) => {
    try {
        // Find transactions of type deposit. Populate user to get name/email.
        const deposits = await Transaction.find({ type: 'deposit' })
            .populate('user', 'email profile.fullname')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: deposits.length, data: deposits });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.approveDeposit = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found' });

        if (transaction.status === 'completed') {
            return res.status(400).json({ success: false, error: 'Transaction already completed' });
        }

        // Complete transaction
        transaction.status = 'completed';
        await transaction.save();

        // Credit User Wallet
        const wallet = await Wallet.findOne({ user: transaction.user });
        if (wallet) {
            wallet.balance += transaction.amount;
            await wallet.save();
        }

        res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.rejectDeposit = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found' });

        transaction.status = 'failed';
        await transaction.save();

        res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Transaction.find({ type: 'withdraw' })
            .populate('user', 'email profile.fullname')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: withdrawals.length, data: withdrawals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.approveWithdrawal = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found' });

        if (transaction.status === 'completed') {
            return res.status(400).json({ success: false, error: 'Transaction already completed' });
        }

        // Complete transaction (Balance already deducted on request)
        transaction.status = 'completed';
        await transaction.save();

        res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.rejectWithdrawal = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found' });

        if (transaction.status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Can only reject pending withdrawals' });
        }

        // Refund User Wallet
        const wallet = await Wallet.findOne({ user: transaction.user });
        if (wallet) {
            wallet.balance += transaction.amount;
            await wallet.save();
        }

        transaction.status = 'failed';
        transaction.details = (transaction.details || '') + ' [Rejected by Admin]';
        await transaction.save();

        res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- EXPERTS (Copy Trading) ---

exports.getExperts = async (req, res) => {
    try {
        const experts = await Expert.find().sort({ followers: -1 });
        res.status(200).json({ success: true, count: experts.length, data: experts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addExpert = async (req, res) => {
    try {
        const { avatar } = req.body;

        if (avatar && avatar.startsWith('data:image')) {
            req.body.avatar = saveBase64Image(avatar, 'expert-avatar');
        }

        const expert = await Expert.create(req.body);
        res.status(201).json({ success: true, data: expert });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteExpert = async (req, res) => {
    try {
        await Expert.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.toggleExpertStatus = async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (!expert) return res.status(404).json({ success: false, error: 'Expert not found' });

        expert.status = expert.status === 'active' ? 'hidden' : 'active';
        await expert.save();

        res.status(200).json({ success: true, data: expert });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- SIGNALS ---

exports.getSignals = async (req, res) => {
    try {
        const signals = await Signal.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: signals.length, data: signals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addSignal = async (req, res) => {
    try {
        const signal = await Signal.create(req.body);
        res.status(201).json({ success: true, data: signal });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteSignal = async (req, res) => {
    try {
        await Signal.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- TRADES (Global History) ---

exports.getTrades = async (req, res) => {
    try {
        const trades = await Trade.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: trades.length, data: trades });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addTrade = async (req, res) => {
    try {
        const trade = await Trade.create(req.body);
        res.status(201).json({ success: true, data: trade });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateTrade = async (req, res) => {
    try {
        const trade = await Trade.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!trade) return res.status(404).json({ success: false, error: 'Trade not found' });
        res.status(200).json({ success: true, data: trade });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteTrade = async (req, res) => {
    try {
        await Trade.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Helper to send token response (Reuse from auth controller logic)
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') options.secure = true;

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        data: user
    });
};
