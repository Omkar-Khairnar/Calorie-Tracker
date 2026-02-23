import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/theme.store';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            aria-label="Toggle Theme"
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-zinc-800 transition-colors">
                {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                    <Moon className="w-4 h-4 text-blue-400" />
                )}
            </div>
            <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
    );
};
