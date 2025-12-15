const PeakHourSettings = require('../models/PeakHourSettings');

// Hardcoded DISCOM tariff rates for Indian states
const DISCOM_TARIFFS = {
    Delhi: {
        peakHours: [{ startHour: 18, endHour: 23, rate: 8 }],
        offPeakHours: [{ startHour: 0, endHour: 6, rate: 3.5 }],
        averageRate: 6.5
    },
    Maharashtra: {
        peakHours: [{ startHour: 17, endHour: 22, rate: 8.5 }],
        offPeakHours: [{ startHour: 0, endHour: 6, rate: 4 }],
        averageRate: 6.5
    },
    Hyderabad: {
        peakHours: [{ startHour: 16, endHour: 22, rate: 7.5 }],
        offPeakHours: [{ startHour: 0, endHour: 6, rate: 3 }],
        averageRate: 5.5
    },
    Bangalore: {
        peakHours: [
            { startHour: 18, endHour: 21, rate: 8 },
            { startHour: 14, endHour: 17, rate: 8 }
        ],
        offPeakHours: [{ startHour: 0, endHour: 6, rate: 4 }],
        averageRate: 6.5
    },
    Kolkata: {
        peakHours: [{ startHour: 17, endHour: 22, rate: 6.5 }],
        offPeakHours: [{ startHour: 0, endHour: 6, rate: 3 }],
        averageRate: 5
    }
};

// Get tariff data for a state
const getTariffForState = (userState) => {
    switch (userState) {
        case 'Delhi':
            return DISCOM_TARIFFS.Delhi;
        case 'Maharashtra':
            return DISCOM_TARIFFS.Maharashtra;
        case 'Hyderabad':
            return DISCOM_TARIFFS.Hyderabad;
        case 'Bangalore':
            return DISCOM_TARIFFS.Bangalore;
        case 'Kolkata':
            return DISCOM_TARIFFS.Kolkata;
        default:
            return null;
    }
};

// Check if hour falls in peak period
const isInPeakHours = (currentHour, peakHours) => {
    for (const slot of peakHours) {
        if (currentHour >= slot.startHour && currentHour < slot.endHour) {
            return { isPeak: true, rate: slot.rate };
        }
    }
    return { isPeak: false, rate: null };
};

// Check if hour falls in off-peak period
const isInOffPeakHours = (currentHour, offPeakHours) => {
    for (const slot of offPeakHours) {
        if (currentHour >= slot.startHour && currentHour < slot.endHour) {
            return { isOffPeak: true, rate: slot.rate };
        }
    }
    return { isOffPeak: false, rate: null };
};

// POST /api/peakHours/setup
exports.setupPeakHours = async (req, res) => {
    try {
        const { userId, userState, discountFlag, subsidyUnits } = req.body;

        // Validate inputs
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing userId' });
        }
        if (!userState || typeof userState !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing userState' });
        }

        // Get tariff data for state
        const tariffData = getTariffForState(userState);
        if (!tariffData) {
            return res.status(400).json({ error: `Unsupported state: ${userState}. Supported states: Delhi, Maharashtra, Hyderabad, Bangalore, Kolkata` });
        }

        // Upsert user settings
        const settings = await PeakHourSettings.findOneAndUpdate(
            { userId },
            {
                userId,
                userState,
                userDiscountFlag: discountFlag || false,
                monthlySubsidyUnits: subsidyUnits || 100,
                peakHours: tariffData.peakHours,
                offPeakHours: tariffData.offPeakHours
            },
            { upsert: true, new: true }
        );

        res.json({
            peakHours: tariffData.peakHours,
            offPeakHours: tariffData.offPeakHours,
            averageRate: tariffData.averageRate,
            ratesPeakvsOffpeak: {
                peak: tariffData.peakHours[0]?.rate || 0,
                offPeak: tariffData.offPeakHours[0]?.rate || 0
            }
        });
    } catch (error) {
        console.error('Setup Peak Hours Error:', error);
        res.status(500).json({ error: 'Server error during peak hours setup' });
    }
};

// POST /api/peakHours/analyze
exports.analyzePeakHours = async (req, res) => {
    try {
        const { userId, currentConsumption, currentHour, currentDayOfWeek } = req.body;

        // Validate inputs
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing userId' });
        }
        if (typeof currentConsumption !== 'number' || currentConsumption < 0) {
            return res.status(400).json({ error: 'Invalid currentConsumption value' });
        }
        if (typeof currentHour !== 'number' || currentHour < 0 || currentHour > 23) {
            return res.status(400).json({ error: 'Invalid currentHour value (must be 0-23)' });
        }
        if (typeof currentDayOfWeek !== 'number' || currentDayOfWeek < 0 || currentDayOfWeek > 6) {
            return res.status(400).json({ error: 'Invalid currentDayOfWeek value (must be 0-6)' });
        }

        // Fetch user settings
        const settings = await PeakHourSettings.findOne({ userId });
        if (!settings) {
            return res.status(404).json({ error: 'User settings not found. Please call /api/peakHours/setup first.' });
        }

        const { peakHours, offPeakHours } = settings;

        // Check if current hour is peak or off-peak
        const peakCheck = isInPeakHours(currentHour, peakHours);
        const offPeakCheck = isInOffPeakHours(currentHour, offPeakHours);

        let isPeakHour = peakCheck.isPeak;
        let currentRate;

        if (peakCheck.isPeak) {
            currentRate = peakCheck.rate;
        } else if (offPeakCheck.isOffPeak) {
            currentRate = offPeakCheck.rate;
        } else {
            // Standard rate (average of peak and off-peak)
            const avgPeakRate = peakHours.reduce((sum, s) => sum + s.rate, 0) / peakHours.length;
            const avgOffPeakRate = offPeakHours.reduce((sum, s) => sum + s.rate, 0) / offPeakHours.length;
            currentRate = (avgPeakRate + avgOffPeakRate) / 2;
        }

        const currentCost = currentConsumption * currentRate;

        // Calculate potential savings if shifted to off-peak
        const lowestOffPeakRate = Math.min(...offPeakHours.map(s => s.rate));
        const costIfOffPeak = currentConsumption * lowestOffPeakRate;
        const potentialSavings = currentCost - costIfOffPeak;
        const percentageSaved = currentCost > 0 ? ((potentialSavings / currentCost) * 100).toFixed(0) : 0;

        // Find best time to run (first off-peak slot)
        let bestTimeToRun = 'After 11 PM';
        if (offPeakHours.length > 0) {
            const bestSlot = offPeakHours.reduce((min, s) => s.rate < min.rate ? s : min, offPeakHours[0]);
            if (bestSlot.startHour === 0) {
                bestTimeToRun = 'After midnight';
            } else if (bestSlot.startHour >= 23) {
                bestTimeToRun = 'After 11 PM';
            } else {
                bestTimeToRun = `After ${bestSlot.startHour > 12 ? bestSlot.startHour - 12 : bestSlot.startHour} ${bestSlot.startHour >= 12 ? 'PM' : 'AM'}`;
            }
        }

        res.json({
            currentHour,
            isPeakHour,
            currentRate,
            currentConsumption,
            currentCost: `₹${currentCost.toFixed(0)}`,
            potentialSavings: {
                ifShiftedToOffpeak: `₹${potentialSavings.toFixed(0)}`,
                percentageSaved: `${percentageSaved}%`,
                bestTimeToRun
            }
        });
    } catch (error) {
        console.error('Analyze Peak Hours Error:', error);
        res.status(500).json({ error: 'Server error during peak hours analysis' });
    }
};

// POST /api/peakHours/monthlyForecast
exports.monthlyForecast = async (req, res) => {
    try {
        const { userId, dailyAverageConsumption } = req.body;

        // Validate inputs
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing userId' });
        }
        if (typeof dailyAverageConsumption !== 'number' || dailyAverageConsumption < 0) {
            return res.status(400).json({ error: 'Invalid dailyAverageConsumption value' });
        }

        // Fetch user settings
        const settings = await PeakHourSettings.findOne({ userId });
        if (!settings) {
            return res.status(404).json({ error: 'User settings not found. Please call /api/peakHours/setup first.' });
        }

        const { peakHours, offPeakHours, userDiscountFlag, monthlySubsidyUnits } = settings;

        // Assume 30 days per month
        const daysPerMonth = 30;
        const monthlyConsumption = dailyAverageConsumption * daysPerMonth;

        // Calculate peak and off-peak rates
        const peakRate = peakHours.length > 0 ? peakHours[0].rate : 6;
        const offPeakRate = offPeakHours.length > 0 ? offPeakHours[0].rate : 3.5;

        // Assume 40% of consumption is during peak hours
        const peakConsumptionRatio = 0.4;
        const peakConsumption = monthlyConsumption * peakConsumptionRatio;
        const offPeakConsumption = monthlyConsumption * (1 - peakConsumptionRatio);

        const currentMonthCost = (peakConsumption * peakRate) + (offPeakConsumption * offPeakRate);

        // Calculate costs if peak reduced by 20%, 40%, 60%
        const calculateReducedCost = (reductionPercent) => {
            const reducedPeakConsumption = peakConsumption * (1 - reductionPercent);
            const shiftedToOffPeak = peakConsumption * reductionPercent;
            const newOffPeakConsumption = offPeakConsumption + shiftedToOffPeak;
            return (reducedPeakConsumption * peakRate) + (newOffPeakConsumption * offPeakRate);
        };

        const ifReducePeakBy20 = calculateReducedCost(0.2);
        const ifReducePeakBy40 = calculateReducedCost(0.4);
        const ifReducePeakBy60 = calculateReducedCost(0.6);

        // Apply subsidy if eligible
        let subsidyDiscount = 0;
        if (userDiscountFlag && monthlyConsumption <= monthlySubsidyUnits) {
            subsidyDiscount = currentMonthCost * 0.1; // 10% subsidy discount
        }

        const suggestedActions = [
            'Shift AC usage to 11 PM - 6 AM',
            'Run water heater after midnight',
            'Charge devices during off-peak hours',
            'Schedule washing machine for early morning',
            'Use timer-controlled appliances for off-peak operation'
        ];

        res.json({
            currentMonthCost: `₹${(currentMonthCost - subsidyDiscount).toFixed(0)}`,
            ifReducePeakBy20: `₹${(ifReducePeakBy20 - subsidyDiscount).toFixed(0)}`,
            ifReducePeakBy40: `₹${(ifReducePeakBy40 - subsidyDiscount).toFixed(0)}`,
            ifReducePeakBy60: `₹${(ifReducePeakBy60 - subsidyDiscount).toFixed(0)}`,
            monthlyConsumption: `${monthlyConsumption.toFixed(0)} units`,
            subsidyApplied: userDiscountFlag && monthlyConsumption <= monthlySubsidyUnits,
            suggestedActions
        });
    } catch (error) {
        console.error('Monthly Forecast Error:', error);
        res.status(500).json({ error: 'Server error during monthly forecast' });
    }
};
