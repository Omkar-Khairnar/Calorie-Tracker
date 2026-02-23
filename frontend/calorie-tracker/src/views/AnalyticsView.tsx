import React, { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
    Activity, TrendingUp, PieChart as PieIcon,
    BarChart3, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { reportsService } from '../api/reports.service';
import { useThemeStore } from '../store/theme.store';
import { PageHeader } from '../components/PageHeader';
import { Skeleton, SkeletonText, SkeletonCard } from '../components/Skeleton';
import { useDelayedLoading } from '../hooks/useDelayedLoading';

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

export const AnalyticsView: React.FC = () => {
    const theme = useThemeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const dateParams = useMemo(() => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
            start: sevenDaysAgo.toISOString(),
            end: today.toISOString()
        };
    }, []);

    const { data: weeklyTrend, isLoading: isTrendLoading } = useQuery({
        queryKey: ['weekly-trend'],
        queryFn: reportsService.getWeeklyTrend,
    });

    const { data: macros, isLoading: isMacrosLoading } = useQuery({
        queryKey: ['macros-breakdown', dateParams],
        queryFn: () => reportsService.getMacrosBreakdown(dateParams.start, dateParams.end),
    });

    const { data: micros, isLoading: isMicrosLoading } = useQuery({
        queryKey: ['micros-summary', dateParams],
        queryFn: () => reportsService.getMicrosSummary(dateParams.start, dateParams.end),
    });

    const hasData = weeklyTrend && macros && micros;

    const pieData = useMemo(() => {
        if (!macros) return [];
        return [
            { name: 'Protein', value: macros.protein_pct },
            { name: 'Carbs', value: macros.carbs_pct },
            { name: 'Fat', value: macros.fat_pct },
        ];
    }, [macros]);

    const barData = useMemo(() => {
        if (!micros) return [];
        return Object.entries(micros).map(([name, value]) => ({
            name,
            value: Number(value)
        })).slice(0, 6); // Top 6 micros
    }, [micros]);

    const showSkeleton = useDelayedLoading(isTrendLoading || isMacrosLoading || isMicrosLoading);

    // Must be declared before any early returns (Rules of Hooks).
    // Hides charts for one RAF so ResponsiveContainer can measure at full size
    // before becoming visible — prevents the "growing from center" artifact.
    const [chartsReady, setChartsReady] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setChartsReady(true));
        return () => cancelAnimationFrame(id);
    }, []);

    if (showSkeleton) {
        return (
            <div className="space-y-5">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-36" />
                        <SkeletonText width="w-52" />
                    </div>
                </div>

                {/* Top row: Area chart + Pie chart */}
                <div className="grid lg:grid-cols-3 gap-5">
                    <SkeletonCard className="lg:col-span-2">
                        {/* Chart title */}
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="w-7 h-7" />
                            <Skeleton className="h-5 w-36" />
                        </div>
                        {/* Fake chart area */}
                        <div className="relative h-48">
                            <Skeleton className="absolute bottom-0 left-0 right-0 h-32 rounded-xl opacity-60" />
                            <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 px-2">
                                {[60, 80, 50, 90, 70, 85, 65].map((h, i) => (
                                    <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                        {/* X-axis labels */}
                        <div className="flex justify-between mt-3">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                <SkeletonText key={d} width="w-6" className="h-2" />
                            ))}
                        </div>
                    </SkeletonCard>

                    {/* Pie chart placeholder */}
                    <SkeletonCard>
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="w-7 h-7" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                        <Skeleton className="w-36 h-36 rounded-full mx-auto mb-4" />
                        <div className="space-y-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="flex items-center gap-2">
                                    <Skeleton className="w-3 h-3 rounded-full" />
                                    <SkeletonText width="w-16" />
                                    <SkeletonText width="w-10" className="ml-auto" />
                                </div>
                            ))}
                        </div>
                    </SkeletonCard>
                </div>

                {/* Bottom row: Bar chart + stat cards */}
                <div className="grid lg:grid-cols-3 gap-5">
                    <SkeletonCard className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="w-7 h-7" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <div className="flex items-end gap-3 h-32">
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${40 + i * 10}%` }} />
                            ))}
                        </div>
                    </SkeletonCard>
                    <div className="space-y-3">
                        {[0, 1, 2].map(i => (
                            <SkeletonCard key={i} className="flex items-center gap-3 p-4">
                                <Skeleton className="w-9 h-9 shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <SkeletonText width="w-20" />
                                    <SkeletonText width="w-12" className="h-5" />
                                </div>
                            </SkeletonCard>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm mx-auto max-w-md">
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                    <Info className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Not enough data yet</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mb-5 leading-relaxed">
                    Log a few more meals to see your trends come to life!
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-5 py-2.5 bg-vitality-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-vitality-500/20 hover:bg-vitality-600 transition-all active:scale-95"
                >
                    Log your first meal
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <PageHeader
                title="Nutritional Analytics"
                subtitle="Insights based on your last 7 days of tracking"
                actions={
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-zinc-800 text-sm font-semibold text-slate-600 dark:text-zinc-400">
                        <TrendingUp className="w-4 h-4 text-vitality-500" />
                        Last 7 Days
                    </div>
                }
            />

            {/* Top Grid: Major Trends */}
            <div
                className={`grid lg:grid-cols-12 gap-4 transition-opacity duration-200 ${chartsReady ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Main Area Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Calorie Trend</h3>
                            <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">Daily intake vs suggested budget</p>
                        </div>
                        <div className="p-2 bg-vitality-50 dark:bg-vitality-900/20 rounded-xl">
                            <Activity className="w-4 h-4 text-vitality-600" />
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <AreaChart data={weeklyTrend}>
                                <defs>
                                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#27272a' : '#f4f4f5'} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString([], { weekday: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDark ? '#52525b' : '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDark ? '#52525b' : '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        backgroundColor: isDark ? '#27272a' : '#ffffff',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontFamily: 'Inter, sans-serif',
                                        color: isDark ? '#f4f4f5' : '#09090b',
                                        fontWeight: '700'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="calories"
                                    stroke="#22c55e"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorCal)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Macro Pie Chart */}
                <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Macros (%)</h3>
                        <PieIcon className="w-5 h-5 text-amber-500" />
                    </div>

                    <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Total</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round(macros?.total_grams || 0)}g</p>
                        </div>
                    </div>

                    <div className="w-full space-y-3 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{entry.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{entry.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Detailed Insights */}
            <div
                className={`grid lg:grid-cols-12 gap-4 transition-opacity duration-200 ${chartsReady ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Micros Bar Chart */}
                <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Micro-nutrients</h3>
                            <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">Aggregation of vitamin & mineral intake</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>

                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <BarChart data={barData}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDark ? '#52525b' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip cursor={{ fill: isDark ? '#27272a' : '#fafafa' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDark ? '#27272a' : '#ffffff', color: isDark ? '#f4f4f5' : '#09090b' }} />
                                <Bar
                                    dataKey="value"
                                    fill="#3b82f6"
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                    isAnimationActive={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Insight Cards */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    <div className="bg-vitality-500 rounded-2xl p-4 text-white text-center flex flex-col justify-center shadow-lg shadow-vitality-500/20">
                        <ArrowUpRight className="w-6 h-6 mx-auto mb-1.5 text-vitality-200" />
                        <p className="text-[10px] font-bold text-vitality-100 uppercase tracking-widest mb-1">Consistency</p>
                        <h4 className="text-xl font-bold">85.4%</h4>
                    </div>
                    <div className="bg-slate-900 dark:bg-zinc-800 rounded-2xl p-4 text-white text-center flex flex-col justify-center border border-slate-700/50 dark:border-zinc-700/50">
                        <ArrowDownRight className="w-6 h-6 mx-auto mb-1.5 text-slate-400 dark:text-zinc-500" />
                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Avg Excess</p>
                        <h4 className="text-xl font-bold">120 kcal</h4>
                    </div>
                    <div className="col-span-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-vitality-100 dark:bg-vitality-900/30 rounded-xl shrink-0">
                            <Info className="w-4 h-4 text-vitality-600 dark:text-vitality-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Weekly Recommendation</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                Increasing your protein intake by 10g at breakfast could help maintain satiety throughout the day.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
