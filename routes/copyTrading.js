const express = require('express');
const { getInvestments, startCopying, stopCopying } = require('../controllers/copyTrading');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getInvestments);
router.route('/start').post(startCopying);
router.route('/stop/:id').put(stopCopying);

module.exports = router;
