import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { useThemeColors } from '../../../context/ThemeContext.tsx';

const data = [
    { day: 'Mon', cost: 45 },
    { day: 'Tue', cost: 52 },
    { day: 'Wed', cost: 38 },
    { day: 'Thu', cost: 65 },
    { day: 'Fri', cost: 48 },
    { day: 'Sat', cost: 59 },
    { day: 'Sun', cost: 42 },
];

const CostAnalysisWidget = () => {
    const themeColors = useThemeColors();

    return (
        <div className="bg-dashboard-card rounded-xl p-6 border border-dashboard-textSecondary/10 h-full">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-dashboard-text font-bold text-lg mb-1">Cost Analytics</h3>
                    <p className="text-dashboard-textSecondary text-xs">Weekly Expenditure</p>
                </div>
                <button className="bg-accent text-dashboard-bg px-3 py-1 rounded text-xs font-bold hover:bg-accent/90 transition-colors">
                    View Report
                </button>
            </div>

            <div className="h-[180px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={themeColors.accent} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={themeColors.accent} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}`, borderRadius: '8px' }}
                            itemStyle={{ color: themeColors.accent }}
                            cursor={{ stroke: themeColors.accent, strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cost"
                            stroke={themeColors.accent}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCost)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-end mt-2">
                <div>
                    <span className="text-dashboard-textSecondary text-xs">Total this week</span>
                    <p className="text-2xl font-bold text-dashboard-text">₹349.00</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-dashboard-success font-bold">+12% ↑</span>
                    <p className="text-dashboard-textSecondary text-[10px]">vs last week</p>
                </div>
            </div>
        </div>
    );
};

export default CostAnalysisWidget;
