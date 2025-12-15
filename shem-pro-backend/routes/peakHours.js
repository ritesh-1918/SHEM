const express = require('express');
const router = express.Router();
const {
    setupPeakHours,
    analyzePeakHours,
    monthlyForecast
} = require('../controllers/peakHoursController');

// @route   POST /api/peakHours/setup
// @desc    Setup peak hours for a user based on their state
// @access  Public
router.post('/setup', setupPeakHours);

// @route   POST /api/peakHours/analyze
// @desc    Analyze current consumption and calculate costs/savings
// @access  Public
router.post('/analyze', analyzePeakHours);

// @route   POST /api/peakHours/monthlyForecast
// @desc    Generate monthly cost forecast with reduction scenarios
// @access  Public
router.post('/monthlyForecast', monthlyForecast);

module.exports = router;
