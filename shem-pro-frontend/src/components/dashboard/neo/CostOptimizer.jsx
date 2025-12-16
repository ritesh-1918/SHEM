import React, { useState, useEffect, useCallback } from 'react';
import {
    ChartBarIcon,
    CalculatorIcon,
    ClipboardDocumentCheckIcon,
    BoltIcon,
    PrinterIcon,
    CogIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    XMarkIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';

// API base URL - uses Render production or localhost for development
const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/peakHours`
    : 'http://localhost:5000/api/peakHours';

// Cache key for localStorage
const CACHE_KEY = 'costOptimizerData';
const CACHE_EXPIRY_KEY = 'costOptimizerExpiry';

// Action items with details
const ACTION_ITEMS = [
    {
        id: 1,
        icon: '🥇',
        title: 'Shift AC to 11 PM - 6 AM',
        monthlySavings: 167,
        annualSavings: 2000,
        effort: 'easy',
        description: 'Use timer or smart plug to run AC during off-peak hours'
    },
    {
        id: 2,
        icon: '🥈',
        title: 'Run water heater after midnight',
        monthlySavings: 80,
        annualSavings: 960,
        effort: 'easy',
        description: 'Heat water during off-peak and use stored hot water'
    },
    {
        id: 3,
        icon: '🥉',
        title: 'Schedule washing for 1-2 AM',
        monthlySavings: 40,
        annualSavings: 480,
        effort: 'medium',
        description: 'Use delay start feature on washing machine'
    },
    {
        id: 4,
        icon: '🏅',
        title: 'Charge EV overnight',
        monthlySavings: 125,
        annualSavings: 1500,
        effort: 'easy',
        description: 'Schedule EV charging for 12 AM - 5 AM'
    },
    {
        id: 5,
        icon: '🏅',
        title: 'Run dishwasher after 11 PM',
        monthlySavings: 25,
        annualSavings: 300,
        effort: 'easy',
        description: 'Use delay start or run before bed'
    }
];

// Effort badge component
const EffortBadge = ({ effort }) => {
    const colors = {
        easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <span className={`px-2 py-0.5 text-xs rounded-full border ${colors[effort]}`}>
            {effort.charAt(0).toUpperCase() + effort.slice(1)}
        </span>
    );
};

// Simple bar chart component
const BarChart = ({ peakUnits, offPeakUnits, peakCost, offPeakCost }) => {
    const maxUnits = Math.max(peakUnits, offPeakUnits);
    const peakHeight = (peakUnits / maxUnits) * 100;
    const offPeakHeight = (offPeakUnits / maxUnits) * 100;

    return (
        <div className="flex items-end justify-center gap-8 h-48 mt-4">
            {/* Peak bar */}
            <div className="flex flex-col items-center">
                <div className="text-sm text-dashboard-textSecondary mb-2">₹{peakCost}</div>
                <div
                    className="w-20 bg-gradient-to-t from-red-600 to-orange-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${peakHeight}%`, minHeight: '20px' }}
                />
                <div className="mt-2 text-center">
                    <p className="text-white font-bold">{peakUnits} units</p>
                    <p className="text-xs text-dashboard-textSecondary">Peak Hours</p>
                </div>
            </div>

            {/* Off-peak bar */}
            <div className="flex flex-col items-center">
                <div className="text-sm text-dashboard-textSecondary mb-2">₹{offPeakCost}</div>
                <div
                    className="w-20 bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${offPeakHeight}%`, minHeight: '20px' }}
                />
                <div className="mt-2 text-center">
                    <p className="text-white font-bold">{offPeakUnits} units</p>
                    <p className="text-xs text-dashboard-textSecondary">Off-Peak</p>
                </div>
            </div>
        </div>
    );
};

// Tab 1: Current Costs
const CurrentCostsTab = ({ data }) => {
    const totalUnits = data.totalUnits || 120;
    const peakUnits = data.peakUnits || 60;
    const offPeakUnits = data.offPeakUnits || 60;
    const peakRate = data.peakRate || 8;
    const offPeakRate = data.offPeakRate || 4;
    const peakCost = peakUnits * peakRate;
    const offPeakCost = offPeakUnits * offPeakRate;
    const totalCost = peakCost + offPeakCost;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-dashboard-textSecondary">Total Consumption</p>
                    <p className="text-2xl font-bold text-white">{totalUnits} <span className="text-sm font-normal">units</span></p>
                </div>
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/20">
                    <p className="text-sm text-dashboard-textSecondary">Total Cost</p>
                    <p className="text-2xl font-bold text-green-400">₹{totalCost}</p>
                </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium text-white mb-3">Cost Breakdown</h4>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-dashboard-textSecondary">Peak Hours ({peakUnits} units @ ₹{peakRate})</span>
                    </div>
                    <span className="text-white font-bold">₹{peakCost}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-dashboard-textSecondary">Off-Peak ({offPeakUnits} units @ ₹{offPeakRate})</span>
                    </div>
                    <span className="text-white font-bold">₹{offPeakCost}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-medium">Total This Month</span>
                    <span className="text-accent font-bold text-lg">₹{totalCost}</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-2">Peak vs Off-Peak Visualization</h4>
                <BarChart
                    peakUnits={peakUnits}
                    offPeakUnits={offPeakUnits}
                    peakCost={peakCost}
                    offPeakCost={offPeakCost}
                />
            </div>
        </div>
    );
};

// Tab 2: What-If Calculator
const WhatIfTab = ({ data }) => {
    const [peakReduction, setPeakReduction] = useState(20);

    const peakUnits = data.peakUnits || 60;
    const peakRate = data.peakRate || 8;
    const offPeakRate = data.offPeakRate || 4;

    // Calculate savings based on reduction
    const unitsShifted = peakUnits * (peakReduction / 100);
    const currentPeakCost = peakUnits * peakRate;
    const newPeakCost = (peakUnits - unitsShifted) * peakRate;
    const additionalOffPeakCost = unitsShifted * offPeakRate;
    const monthlySavings = currentPeakCost - newPeakCost - additionalOffPeakCost + (unitsShifted * offPeakRate);
    const actualSavings = unitsShifted * (peakRate - offPeakRate);
    const annualSavings = actualSavings * 12;

    // Scenario cards
    const scenarios = [
        { appliance: 'AC', percent: 20, savings: 156 },
        { appliance: 'Water Heater', percent: 100, savings: 80 },
        { appliance: 'Washing Machine', percent: 100, savings: 40 }
    ];

    return (
        <div className="space-y-6">
            {/* Interactive Slider */}
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-500/20">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <CalculatorIcon className="w-5 h-5 text-purple-400" />
                    Adjust Peak Usage Reduction
                </h4>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-dashboard-textSecondary">Reduce peak usage by:</span>
                        <span className="text-white font-bold">{peakReduction}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={peakReduction}
                        onChange={(e) => setPeakReduction(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-dashboard-textSecondary mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Real-time savings display */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <p className="text-sm text-dashboard-textSecondary">Monthly Savings</p>
                        <p className="text-2xl font-bold text-green-400">₹{actualSavings.toFixed(0)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <p className="text-sm text-dashboard-textSecondary">Annual Savings</p>
                        <p className="text-2xl font-bold text-accent">₹{annualSavings.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            {/* Scenario Cards */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Quick Scenarios</h4>

                {scenarios.map((scenario, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/20 rounded-lg">
                                <BoltIcon className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Shift {scenario.percent}% of {scenario.appliance}</p>
                                <p className="text-xs text-dashboard-textSecondary">Move to off-peak hours</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-green-400 font-bold">Save ₹{scenario.savings}/month</p>
                            <p className="text-xs text-dashboard-textSecondary">₹{scenario.savings * 12}/year</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Potential */}
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/30">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-dashboard-textSecondary text-sm">Total Potential Savings</p>
                        <p className="text-3xl font-bold text-green-400">₹{scenarios.reduce((sum, s) => sum + s.savings, 0)}/month</p>
                    </div>
                    <div className="text-right">
                        <p className="text-dashboard-textSecondary text-sm">Annual</p>
                        <p className="text-xl font-bold text-white">₹{scenarios.reduce((sum, s) => sum + s.savings * 12, 0)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tab 3: Action Plan
const ActionPlanTab = ({ completedActions, onToggleAction }) => {
    const totalSavings = ACTION_ITEMS.reduce((sum, item) => sum + item.annualSavings, 0);
    const completedSavings = ACTION_ITEMS
        .filter(item => completedActions.includes(item.id))
        .reduce((sum, item) => sum + item.annualSavings, 0);

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-dashboard-textSecondary text-sm">Your Progress</span>
                    <span className="text-white font-medium">
                        {completedActions.length}/{ACTION_ITEMS.length} actions completed
                    </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-accent to-yellow-400 transition-all duration-500"
                        style={{ width: `${(completedActions.length / ACTION_ITEMS.length) * 100}%` }}
                    />
                </div>
                <div className="mt-2 text-center text-sm">
                    <span className="text-green-400">₹{completedSavings}</span>
                    <span className="text-dashboard-textSecondary"> of ₹{totalSavings} annual savings unlocked</span>
                </div>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
                {ACTION_ITEMS.map((item) => {
                    const isCompleted = completedActions.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            className={`relative rounded-xl p-4 transition-all duration-300 ${isCompleted
                                ? 'bg-green-900/20 border border-green-500/30'
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">{item.icon}</span>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-medium ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                                            {item.title}
                                        </h4>
                                        <EffortBadge effort={item.effort} />
                                    </div>
                                    <p className="text-sm text-dashboard-textSecondary mb-2">{item.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-green-400">Save ₹{item.monthlySavings}/month</span>
                                        <span className="text-dashboard-textSecondary">•</span>
                                        <span className="text-accent">₹{item.annualSavings}/year</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onToggleAction(item.id)}
                                    className={`p-2 rounded-lg transition-colors ${isCompleted
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-white/10 text-dashboard-textSecondary hover:text-white'
                                        }`}
                                >
                                    <CheckCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Main CostOptimizer Component
const CostOptimizer = ({ userId = 'user123', onNavigateToControl }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalUnits: 120,
        peakUnits: 60,
        offPeakUnits: 60,
        peakRate: 8,
        offPeakRate: 4
    });
    const [completedActions, setCompletedActions] = useState(() => {
        const saved = localStorage.getItem('completedActions');
        return saved ? JSON.parse(saved) : [];
    });

    const tabs = [
        { name: 'Your Current Costs', icon: ChartBarIcon },
        { name: 'What-If Scenarios', icon: CalculatorIcon },
        { name: 'Action Plan', icon: ClipboardDocumentCheckIcon }
    ];

    // Fetch data with caching
    const fetchData = useCallback(async () => {
        // Check cache first
        const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (cachedExpiry && cachedData) {
            const expiry = new Date(cachedExpiry);
            if (new Date() < expiry) {
                setData(JSON.parse(cachedData));
                setLoading(false);
                return;
            }
        }

        try {
            const response = await fetch(`${API_BASE}/monthlyForecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dailyAverageConsumption: 4 })
            });

            if (response.ok) {
                const result = await response.json();

                // Parse the data
                const newData = {
                    totalUnits: parseInt(result.monthlyConsumption) || 120,
                    peakUnits: Math.round((parseInt(result.monthlyConsumption) || 120) * 0.5),
                    offPeakUnits: Math.round((parseInt(result.monthlyConsumption) || 120) * 0.5),
                    peakRate: 8,
                    offPeakRate: 4,
                    currentCost: result.currentMonthCost,
                    reducedCosts: {
                        by20: result.ifReducePeakBy20,
                        by40: result.ifReducePeakBy40,
                        by60: result.ifReducePeakBy60
                    }
                };

                setData(newData);

                // Cache until midnight
                const midnight = new Date();
                midnight.setHours(24, 0, 0, 0);
                localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
                localStorage.setItem(CACHE_EXPIRY_KEY, midnight.toISOString());
            }
        } catch (err) {
            console.error('Failed to fetch forecast data:', err);
        }
        setLoading(false);
    }, [userId]);

    // Toggle action completion
    const toggleAction = (actionId) => {
        setCompletedActions(prev => {
            const newCompleted = prev.includes(actionId)
                ? prev.filter(id => id !== actionId)
                : [...prev, actionId];

            localStorage.setItem('completedActions', JSON.stringify(newCompleted));
            return newCompleted;
        });
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Initialize
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="bg-dashboard-card rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-accent/20 rounded-xl">
                            <CalculatorIcon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Cost Optimizer</h2>
                            <p className="text-sm text-dashboard-textSecondary">Maximize your savings potential</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowPathIcon className={`w-5 h-5 text-dashboard-textSecondary ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === idx
                            ? 'text-accent border-b-2 border-accent bg-accent/5'
                            : 'text-dashboard-textSecondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <ArrowPathIcon className="w-8 h-8 text-accent animate-spin" />
                    </div>
                ) : (
                    <>
                        {activeTab === 0 && <CurrentCostsTab data={data} />}
                        {activeTab === 1 && <WhatIfTab data={data} />}
                        {activeTab === 2 && (
                            <ActionPlanTab
                                completedActions={completedActions}
                                onToggleAction={toggleAction}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onNavigateToControl}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 rounded-xl transition-colors text-white font-medium"
                    >
                        <CogIcon className="w-5 h-5" />
                        Enable Smart Scheduling
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white font-medium"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        Print Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CostOptimizer;
