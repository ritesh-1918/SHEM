import React from 'react';
import { BoltIcon, FireIcon, CurrencyRupeeIcon, SignalIcon, SparklesIcon, ScaleIcon } from '@heroicons/react/24/solid';

const MetricCard = ({ label, value, unit, change, icon: Icon, color = "text-accent" }) => (
    <div className="flex-shrink-0 bg-dashboard-card rounded-lg p-4 w-52 mr-4 border border-dashboard-textSecondary/10 hover:border-accent/30 transition-colors">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-dashboard-text/5 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <span className="text-dashboard-textSecondary text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-end justify-between">
            <span className="text-xl font-bold text-dashboard-text tracking-tight">
                {value} <span className="text-sm text-dashboard-textSecondary font-normal">{unit}</span>
            </span>
            {change && (
                <span className={`text-xs font-bold ${change >= 0 ? 'text-dashboard-success' : 'text-dashboard-danger'}`}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                </span>
            )}
        </div>
    </div>
);

const SensorTicker = ({ data }) => {
    // Mock data fallback or use real data
    const metrics = [
        { label: 'Voltage', value: data?.voltage?.toFixed(1) || '240.5', unit: 'V', change: 0.2, icon: BoltIcon, color: 'text-yellow-400' },
        { label: 'Current', value: data?.current?.toFixed(2) || '2.14', unit: 'A', change: -1.5, icon: SignalIcon, color: 'text-blue-400' },
        { label: 'Power', value: data?.power?.toFixed(0) || '514', unit: 'W', change: 1.2, icon: FireIcon, color: 'text-red-400' },
        { label: 'Energy', value: data?.energy_kWh?.toFixed(3) || '14.28', unit: 'kWh', change: 5.4, icon: SparklesIcon, color: 'text-green-400' },
        { label: 'Cost', value: data?.cost_rs?.toFixed(1) || '108.5', unit: '₹', change: 2.1, icon: CurrencyRupeeIcon, color: 'text-accent' },
        { label: 'PF', value: data?.pf?.toFixed(2) || '0.98', unit: '', change: 0.0, icon: ScaleIcon, color: 'text-purple-400' },
        { label: 'Frequency', value: data?.frequency?.toFixed(1) || '50.1', unit: 'Hz', change: 0.1, icon: SignalIcon, color: 'text-gray-400' },
    ];

    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex">
                {metrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                ))}
            </div>
        </div>
    );
};

export default SensorTicker;
