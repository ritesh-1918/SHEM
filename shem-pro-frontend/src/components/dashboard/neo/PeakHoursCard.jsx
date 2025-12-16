import React, { useState, useEffect, useCallback } from 'react';
import {
    BoltIcon,
    ClockIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    XMarkIcon,
    CalendarDaysIcon,
    CalculatorIcon
} from '@heroicons/react/24/solid';

// API base URL - uses Render production or localhost for development
const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/peakHours`
    : 'http://localhost:5000/api/peakHours';

// Appliance suggestions with icons and savings
const APPLIANCE_SUGGESTIONS = [
    { name: 'AC', icon: '❄️', suggestion: 'Run 11 PM - 6 AM', savings: 200 },
    { name: 'Water Heater', icon: '🚿', suggestion: 'Use after midnight', savings: 80 },
    { name: 'Washing Machine', icon: '👕', suggestion: 'Schedule 1-2 AM', savings: 45 },
    { name: 'EV Charging', icon: '🔌', suggestion: 'Charge overnight', savings: 150 },
    { name: 'Dishwasher', icon: '🍽️', suggestion: 'Run after 11 PM', savings: 30 }
];

// Weekly schedule modal
const ScheduleModal = ({ isOpen, onClose, peakHours, offPeakHours }) => {
    if (!isOpen) return null;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const isInRange = (hour, ranges) => {
        return ranges?.some(r => hour >= r.startHour && hour < r.endHour);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dashboard-card rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarDaysIcon className="w-6 h-6 text-accent" />
                        Weekly Peak Hours Schedule
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        {/* Hours header */}
                        <div className="flex gap-1 mb-2">
                            <div className="w-12"></div>
                            {hours.filter((_, i) => i % 3 === 0).map(h => (
                                <div key={h} className="flex-1 text-xs text-dashboard-textSecondary text-center">
                                    {h}:00
                                </div>
                            ))}
                        </div>

                        {/* Days rows */}
                        {days.map(day => (
                            <div key={day} className="flex gap-1 mb-1">
                                <div className="w-12 text-sm text-dashboard-textSecondary flex items-center">{day}</div>
                                <div className="flex-1 flex gap-0.5">
                                    {hours.map(h => (
                                        <div
                                            key={h}
                                            className={`flex-1 h-6 rounded-sm transition-colors ${isInRange(h, peakHours)
                                                ? 'bg-red-500/70'
                                                : isInRange(h, offPeakHours)
                                                    ? 'bg-green-500/70'
                                                    : 'bg-white/10'
                                                }`}
                                            title={`${h}:00 - ${isInRange(h, peakHours) ? 'Peak' : isInRange(h, offPeakHours) ? 'Off-Peak' : 'Standard'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500/70 rounded" />
                                <span className="text-sm text-dashboard-textSecondary">Peak Hours (Higher Rate)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500/70 rounded" />
                                <span className="text-sm text-dashboard-textSecondary">Off-Peak Hours (Lower Rate)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white/10 rounded" />
                                <span className="text-sm text-dashboard-textSecondary">Standard Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Savings calculator modal
const CalculatorModal = ({ isOpen, onClose, peakRate, offPeakRate }) => {
    const [consumption, setConsumption] = useState(500);
    const [peakPercent, setPeakPercent] = useState(40);

    if (!isOpen) return null;

    const peakCost = (consumption * (peakPercent / 100) * peakRate).toFixed(0);
    const offPeakCost = (consumption * ((100 - peakPercent) / 100) * offPeakRate).toFixed(0);
    const totalCost = parseInt(peakCost) + parseInt(offPeakCost);

    // What-if: shift 50% of peak to off-peak
    const shiftedPeakCost = (consumption * (peakPercent / 100) * 0.5 * peakRate).toFixed(0);
    const shiftedOffPeakCost = (consumption * ((100 - peakPercent / 2) / 100) * offPeakRate).toFixed(0);
    const shiftedTotal = parseInt(shiftedPeakCost) + parseInt(shiftedOffPeakCost);
    const savings = totalCost - shiftedTotal;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dashboard-card rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalculatorIcon className="w-6 h-6 text-accent" />
                        Savings Calculator
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Consumption input */}
                    <div>
                        <label className="text-sm text-dashboard-textSecondary mb-2 block">Daily Consumption (Wh)</label>
                        <input
                            type="range"
                            min="100"
                            max="2000"
                            value={consumption}
                            onChange={e => setConsumption(parseInt(e.target.value))}
                            className="w-full accent-accent"
                        />
                        <div className="text-right text-white font-bold">{consumption} Wh</div>
                    </div>

                    {/* Peak percentage input */}
                    <div>
                        <label className="text-sm text-dashboard-textSecondary mb-2 block">% Usage During Peak Hours</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={peakPercent}
                            onChange={e => setPeakPercent(parseInt(e.target.value))}
                            className="w-full accent-accent"
                        />
                        <div className="text-right text-white font-bold">{peakPercent}%</div>
                    </div>

                    {/* Results */}
                    <div className="bg-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-dashboard-textSecondary">Current Daily Cost</span>
                            <span className="text-white font-bold">₹{totalCost}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dashboard-textSecondary">If 50% shifted to off-peak</span>
                            <span className="text-green-400 font-bold">₹{shiftedTotal}</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between">
                            <span className="text-accent font-bold">Potential Daily Savings</span>
                            <span className="text-accent font-bold">₹{savings}</span>
                        </div>
                        <div className="text-center text-sm text-dashboard-textSecondary">
                            ≈ ₹{savings * 30}/month
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main PeakHoursCard component
const PeakHoursCard = ({ data, userId = 'user123' }) => {
    const [loading, setLoading] = useState(true);
    const [analysisData, setAnalysisData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0 });
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCalculatorModal, setShowCalculatorModal] = useState(false);
    const [forecastIndex, setForecastIndex] = useState(0);

    // Initialize settings on mount
    const initializeSettings = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userState: 'Delhi',
                    discountFlag: true,
                    subsidyUnits: 150
                })
            });
            const settingsData = await response.json();
            setSettings(settingsData);
        } catch (err) {
            console.error('Failed to initialize peak hours settings:', err);
        }
    }, [userId]);

    // Analyze current consumption
    const analyzeConsumption = useCallback(async () => {
        if (!settings) return;

        const currentHour = new Date().getHours();
        const currentDayOfWeek = new Date().getDay();
        const currentConsumption = data?.power || 500;

        try {
            const response = await fetch(`${API_BASE}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    currentConsumption,
                    currentHour,
                    currentDayOfWeek
                })
            });
            const analysis = await response.json();
            setAnalysisData(analysis);
            setLoading(false);
        } catch (err) {
            console.error('Failed to analyze consumption:', err);
            setLoading(false);
        }
    }, [settings, data, userId]);

    // Calculate countdown to next rate change
    const updateCountdown = useCallback(() => {
        if (!settings) return;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        // Find next rate change
        let nextChangeHour = 23; // Default to 11 PM

        if (settings.peakHours?.length > 0) {
            const peakEnd = settings.peakHours[0].endHour;
            const peakStart = settings.peakHours[0].startHour;

            if (currentHour >= peakStart && currentHour < peakEnd) {
                nextChangeHour = peakEnd;
            } else if (currentHour < peakStart) {
                nextChangeHour = peakStart;
            } else {
                // After peak, next change is off-peak end or next day peak start
                nextChangeHour = settings.offPeakHours?.[0]?.endHour || 6;
            }
        }

        let hoursRemaining = nextChangeHour - currentHour - 1;
        let minutesRemaining = 60 - currentMinutes;

        if (minutesRemaining === 60) {
            minutesRemaining = 0;
            hoursRemaining += 1;
        }

        if (hoursRemaining < 0) hoursRemaining += 24;

        setCountdown({ hours: hoursRemaining, minutes: minutesRemaining });
    }, [settings]);

    // Initialize on mount
    useEffect(() => {
        initializeSettings();
    }, [initializeSettings]);

    // Analyze when settings loaded or data changes
    useEffect(() => {
        if (settings) {
            analyzeConsumption();
        }
    }, [settings, analyzeConsumption]);

    // Refresh analysis every 60 seconds
    useEffect(() => {
        const interval = setInterval(analyzeConsumption, 60000);
        return () => clearInterval(interval);
    }, [analyzeConsumption]);

    // Update countdown every second
    useEffect(() => {
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [updateCountdown]);

    // Calculate savings percentage for slider
    const savingsPercentage = analysisData?.potentialSavings?.percentageSaved
        ? parseInt(analysisData.potentialSavings.percentageSaved)
        : 0;

    // Determine border color and icon based on peak status
    const isPeak = analysisData?.isPeakHour;
    const borderColor = isPeak ? 'border-red-500/50' : 'border-green-500/50';
    const gradientBg = isPeak
        ? 'from-red-900/20 to-orange-900/20'
        : 'from-green-900/20 to-emerald-900/20';

    // Next 24 hours forecast (simplified)
    const forecastItems = [
        { time: 'Now', isPeak, rate: analysisData?.currentRate || 6 },
        { time: '+3h', isPeak: true, rate: 8 },
        { time: '+6h', isPeak: false, rate: 3.5 },
        { time: '+12h', isPeak: false, rate: 3.5 },
        { time: '+18h', isPeak: true, rate: 8 }
    ];

    return (
        <>
            <div className={`bg-gradient-to-br ${gradientBg} rounded-2xl p-6 border-2 ${borderColor} transition-all duration-500 hover:scale-[1.01]`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${isPeak ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                            <span className="text-2xl">{isPeak ? '⚡' : '💚'}</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Smart Tariff Savings</h3>
                            <p className="text-sm text-dashboard-textSecondary">
                                {isPeak ? 'Peak Hours' : 'Off-Peak Hours'} (₹{analysisData?.currentRate || 6}/unit)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={analyzeConsumption}
                        disabled={loading}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowPathIcon className={`w-5 h-5 text-white/70 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Countdown Timer */}
                <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${isPeak ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    <ClockIcon className="w-5 h-5 text-accent" />
                    <span className="text-sm text-white">
                        ⏱️ {countdown.hours}h {countdown.minutes}m until {isPeak ? 'off-peak rates' : 'peak hours'}
                    </span>
                </div>

                {/* Current Status */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-dashboard-textSecondary mb-1">Current Power</p>
                        <p className="text-xl font-bold text-white flex items-center gap-2">
                            <BoltIcon className="w-5 h-5 text-yellow-400" />
                            {data?.power?.toFixed(0) || analysisData?.currentConsumption || 0} W
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-dashboard-textSecondary mb-1">Hourly Cost</p>
                        <p className="text-xl font-bold text-white">
                            {analysisData?.currentCost || '₹0'}
                        </p>
                    </div>
                </div>

                {/* Savings Slider */}
                {isPeak && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-dashboard-textSecondary mb-2">
                            <span>Savings if shifted to off-peak</span>
                            <span className="text-green-400 font-bold">{savingsPercentage}% saved</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${savingsPercentage}%` }}
                            />
                        </div>
                        <p className="text-center text-sm text-green-400 mt-2">
                            Save {analysisData?.potentialSavings?.ifShiftedToOffpeak || '₹0'} • Best time: {analysisData?.potentialSavings?.bestTimeToRun || 'After 11 PM'}
                        </p>
                    </div>
                )}

                {/* Appliance Suggestions */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-white mb-3">💡 Shift to Off-Peak & Save</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {APPLIANCE_SUGGESTIONS.slice(0, 4).map((appliance, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <span className="text-xl">{appliance.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-medium truncate">{appliance.name}</p>
                                    <p className="text-xs text-dashboard-textSecondary truncate">{appliance.suggestion}</p>
                                </div>
                                <span className="text-xs text-green-400 whitespace-nowrap">₹{appliance.savings}/day</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 24h Forecast Swiper */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-white mb-2">📊 24-Hour Forecast</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {forecastItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-center ${item.isPeak ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'
                                    }`}
                            >
                                <p className="text-xs text-dashboard-textSecondary">{item.time}</p>
                                <p className={`text-sm font-bold ${item.isPeak ? 'text-red-400' : 'text-green-400'}`}>
                                    ₹{item.rate}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white text-sm font-medium"
                    >
                        <CalendarDaysIcon className="w-4 h-4" />
                        View Schedule
                    </button>
                    <button
                        onClick={() => setShowCalculatorModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-accent/20 hover:bg-accent/30 rounded-xl transition-colors text-accent text-sm font-medium"
                    >
                        <CalculatorIcon className="w-4 h-4" />
                        Calculate Savings
                    </button>
                </div>

                {/* Next Off-Peak Indicator */}
                <div className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">🌙</span>
                        <span className="text-sm text-dashboard-textSecondary">
                            Next Off-Peak: <span className="text-white">12 AM - 6 AM</span>
                        </span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-dashboard-textSecondary" />
                </div>
            </div>

            {/* Modals */}
            <ScheduleModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                peakHours={settings?.peakHours}
                offPeakHours={settings?.offPeakHours}
            />
            <CalculatorModal
                isOpen={showCalculatorModal}
                onClose={() => setShowCalculatorModal(false)}
                peakRate={analysisData?.currentRate || 8}
                offPeakRate={settings?.offPeakHours?.[0]?.rate || 3.5}
            />
        </>
    );
};

export default PeakHoursCard;
