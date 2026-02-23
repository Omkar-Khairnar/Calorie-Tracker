import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Utensils, BarChart3, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../api/auth.service';
import { ThemeToggle } from '../ThemeToggle';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await authService.logout();
            logout();
        } catch (e) {
            console.error('Logout failed', e);
            logout();
        }
    };

    const sidebarItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Meal Log', icon: Utensils, path: '/meals' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
        { name: 'AI Chat', icon: MessageSquare, path: '/ai' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800 transition-colors">
                {/* Logo */}
                <div className="px-5 py-4 flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800">
                    <div className="w-7 h-7 bg-vitality-500 rounded-lg flex items-center justify-center shrink-0">
                        <Utensils className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Vitality</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-3 space-y-0.5">
                    <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-600">Navigation</p>
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
                                    isActive
                                        ? "bg-vitality-50 dark:bg-vitality-900/20 text-vitality-700 dark:text-vitality-400 font-semibold"
                                        : "text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-white font-medium"
                                )}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-vitality-500 rounded-r-full" />
                                )}
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                    isActive
                                        ? "bg-vitality-100 dark:bg-vitality-900/40"
                                        : "bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-zinc-700"
                                )}>
                                    <item.icon className={cn(
                                        "w-4 h-4",
                                        isActive ? "text-vitality-600 dark:text-vitality-400" : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300"
                                    )} />
                                </div>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="px-3 py-3 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                    <ThemeToggle />

                    {/* User Info */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl">
                        <div className="w-7 h-7 rounded-full bg-vitality-100 dark:bg-vitality-900/30 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-vitality-600 dark:text-vitality-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{user?.email}</p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{user?.timezone}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20">
                            <LogOut className="w-4 h-4" />
                        </div>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-vitality-500 rounded-lg flex items-center justify-center">
                            <Utensils className="text-white w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-base text-slate-900 dark:text-white">Vitality</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="p-2 text-slate-500 dark:text-zinc-400">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden flex items-center justify-around px-2 py-2 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors",
                                location.pathname === item.path ? "text-vitality-600 dark:text-vitality-400" : "text-slate-400 dark:text-zinc-500"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </main>
        </div>
    );
};
