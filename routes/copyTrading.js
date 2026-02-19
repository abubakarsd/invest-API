const express = require('express');
const { getInvestments, startCopying, stopCopying, getExperts } = require('../controllers/copyTrading');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getInvestments);
router.route('/experts').get(getExperts);
router.route('/start').post(startCopying);
router.route('/stop/:id').put(stopCopying);

module.exports = router;
