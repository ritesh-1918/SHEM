import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'cyberpunk' | 'nature';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    // Initialize theme from localStorage or default to 'dark'
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('shem-theme');
        return (savedTheme as Theme) || 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Using data-attribute for cleaner CSS
        root.setAttribute('data-theme', theme);
        localStorage.setItem('shem-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Helper hook to get current hex colors for Recharts (since they can't usage CSS vars easily)
export const useThemeColors = () => {
    const { theme } = useTheme();

    const colors = {
        dark: {
            bg: '#1a1d29',
            card: '#252836',
            text: '#ffffff',
            textSecondary: '#8a8d9c',
            accent: '#f7b529',
            success: '#22c55e',
            danger: '#ef4444',
            grid: '#ffffff10'
        },
        light: {
            bg: '#f3f4f6',
            card: '#ffffff',
            text: '#111827',
            textSecondary: '#4b5563',
            accent: '#2563eb',
            success: '#16a34a',
            danger: '#dc2626',
            grid: '#00000010'
        },
        cyberpunk: {
            bg: '#050510',
            card: '#0f0b29',
            text: '#e2e8f0',
            textSecondary: '#94a3b8',
            accent: '#d946ef',
            success: '#00ff9d',
            danger: '#ff0055',
            grid: '#d946ef20'
        },
        nature: {
            bg: '#ecfdf5',
            card: '#ffffff',
            text: '#064e3b',
            textSecondary: '#065f46',
            accent: '#059669',
            success: '#047857',
            danger: '#be123c',
            grid: '#05966910'
        }
    };

    return colors[theme];
};
