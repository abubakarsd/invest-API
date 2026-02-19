const express = require('express');
const {
    adminLogin,
    getDashboardStats,
    getSystemWallets,
    addSystemWallet,
    deleteSystemWallet,
    getAllUsers,
    toggleBanUser,
    getDeposits,
    approveDeposit,
    rejectDeposit,
    getWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    getExperts,
    addExpert,
    deleteExpert,
    toggleExpertStatus,
    getSignals,
    addSignal,
    deleteSignal,
    getTrades,
    addTrade,
    updateTrade,
    deleteTrade
} = require('../controllers/admin');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public Admin Route
router.post('/auth/login', adminLogin);

// Protected Admin Routes
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);

// System Wallets
router.get('/wallets', getSystemWallets);
router.post('/wallets', upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'qrCode', maxCount: 1 }]), addSystemWallet); // Updated with upload middleware
router.delete('/wallets/:id', deleteSystemWallet);

// Users
router.route('/users')
    .get(getAllUsers);
router.route('/users/:id/toggle-ban')
    .put(toggleBanUser);

// Financials
router.route('/deposits')
    .get(getDeposits);
router.route('/deposits/:id/approve')
    .put(approveDeposit);
router.route('/deposits/:id/reject')
    .put(rejectDeposit);

router.route('/withdrawals')
    .get(getWithdrawals);
router.route('/withdrawals/:id/approve')
    .put(approveWithdrawal);
router.route('/withdrawals/:id/reject')
    .put(rejectWithdrawal);

// Experts
router.route('/experts')
    .get(getExperts)
    .post(addExpert);
router.route('/experts/:id')
    .delete(deleteExpert);
router.route('/experts/:id/toggle-status')
    .put(toggleExpertStatus);

// Signals
router.route('/signals')
    .get(getSignals)
    .post(addSignal);
router.route('/signals/:id')
    .delete(deleteSignal);

// Trades
router.route('/trades')
    .get(getTrades)
    .post(addTrade);
router.route('/trades/:id')
    .put(updateTrade)
    .delete(deleteTrade);

module.exports = router;
