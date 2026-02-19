const express = require('express');
const { getWallet, deposit, withdraw, getTransactions, getSystemWallets } = require('../controllers/wallet');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/').get(getWallet);
router.route('/system-wallets').get(getSystemWallets);
router.route('/deposit').post(deposit);
router.route('/withdraw').post(withdraw);
router.route('/transactions').get(getTransactions);

module.exports = router;
