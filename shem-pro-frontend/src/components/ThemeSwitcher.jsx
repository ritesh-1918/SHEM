import React from 'react';
import { useTheme } from '../context/ThemeContext.tsx';
import { SwatchIcon, SunIcon, MoonIcon, SparklesIcon, GlobeAsiaAustraliaIcon } from '@heroicons/react/24/outline';

const themes = [
    { id: 'dark', name: 'Premium Dark', icon: MoonIcon, color: 'bg-[#1a1d29]' },
    { id: 'light', name: 'Light Mode', icon: SunIcon, color: 'bg-white border-gray-200 text-black' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: SparklesIcon, color: 'bg-[#0f0b29] text-fuchsia-500 border-fuchsia-500/50' },
    { id: 'nature', name: 'Nature', icon: GlobeAsiaAustraliaIcon, color: 'bg-emerald-50 text-emerald-700 border-emerald-500' },
];

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="bg-dashboard-card p-4 rounded-xl border border-dashboard-textSecondary/20 space-y-3">
            <h3 className="text-dashboard-text font-semibold flex items-center gap-2">
                <SwatchIcon className="w-5 h-5 text-accent" />
                Appearance
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`
                                relative p-3 rounded-lg border transition-all duration-200 flex items-center gap-2
                                ${isActive
                                    ? 'border-accent bg-accent/10 text-accent ring-1 ring-accent'
                                    : 'border-white/10 hover:border-white/20 text-dashboard-textSecondary hover:text-dashboard-text hover:bg-dashboard-text/5'
                                }
                            `}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${t.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{t.name}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default ThemeSwitcher;
