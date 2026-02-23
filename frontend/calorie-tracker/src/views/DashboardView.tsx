import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Beef, Wheat, Droplets, Flame, Target, Edit3, Plus, Clock, ChevronRight, Utensils, TrendingDown, CheckCircle2, Zap, Coffee } from 'lucide-react';
import { reportsService } from '../api/reports.service';
import { mealsService } from '../api/meals.service';
import { GoalProgressBar } from '../components/GoalProgressBar';
import { GoalModal } from '../containers/GoalModal';
import { MealModal } from '../containers/MealModal';
import { PageHeader } from '../components/PageHeader';
import { Skeleton, SkeletonText, SkeletonCard } from '../components/Skeleton';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import type { ReportSummary } from '../types';
import { cn } from '../utils/cn';

export const DashboardView: React.FC = () => {
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: summaryData, isLoading: isSummaryLoading } = useQuery<ReportSummary>({
        queryKey: ['daily-summary', new Date().toISOString().split('T')[0]],
        queryFn: () => reportsService.getDailySummary(),
    });

    const { data: recentMealsPage, isLoading: isMealsLoading } = useQuery({
        queryKey: ['recent-meals'],
        queryFn: () => mealsService.getMeals({ limit: 5 }),
    });
    const recentMeals = recentMealsPage?.items ?? [];

    const refreshDashboard = () => {
        queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
        queryClient.invalidateQueries({ queryKey: ['recent-meals'] });
    };

    const showSkeleton = useDelayedLoading(isSummaryLoading || isMealsLoading);

    // Give the browser one tick to paint bars at 0%, then animate to real width
    const [barsMounted, setBarsMounted] = useState(false);
    useEffect(() => {
        const id = setTimeout(() => setBarsMounted(true), 50);
        return () => clearTimeout(id);
    }, []);

    if (showSkeleton) {
        return (
            <div className="space-y-5">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <SkeletonText width="w-56" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>

                {/* Main grid skeleton */}
                <div className="grid lg:grid-cols-12 gap-5">
                    {/* Left col */}
                    <div className="lg:col-span-8 space-y-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Calorie ring */}
                            <SkeletonCard className="flex items-center justify-center">
                                <Skeleton className="w-48 h-48 rounded-full" />
                            </SkeletonCard>
                            {/* Steady Gains */}
                            <Skeleton className="rounded-2xl h-48" />
                        </div>
                        {/* Macro cards */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[0, 1, 2].map(i => (
                                <SkeletonCard key={i}>
                                    <Skeleton className="w-9 h-9 mb-3" />
                                    <SkeletonText width="w-16" className="mb-2" />
                                    <SkeletonText width="w-24" className="h-6 mb-2" />
                                    <Skeleton className="h-1.5 w-full rounded-full" />
                                </SkeletonCard>
                            ))}
                        </div>
                    </div>
                    {/* Right col */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <SkeletonText width="w-28" />
                            <SkeletonText width="w-14" />
                        </div>
                        <div className="space-y-2">
                            {[0, 1, 2, 3, 4].map(i => (
                                <SkeletonCard key={i} className="flex items-center gap-3 p-3">
                                    <Skeleton className="w-10 h-10 shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <SkeletonText width="w-3/4" />
                                        <SkeletonText width="w-1/2" />
                                    </div>
                                </SkeletonCard>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const actual = summaryData?.actual || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const goal = summaryData?.goal;

    // Derive a human-readable label from the active goal's type
    const goalTypeLabel = goal?.goal_type
        ? goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)
        : 'Daily';

    // Build period subtitle
    const formatPeriodSubtitle = () => {
        if (!summaryData?.period_start) {
            return `Tracking ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
        }
        const start = new Date(summaryData.period_start + 'T00:00:00');
        const end = new Date(summaryData.period_end + 'T00:00:00');
        if (summaryData.period_start === summaryData.period_end) {
            // daily
            return `Tracking ${start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
        }
        // weekly or monthly range
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${goalTypeLabel} period: ${fmt(start)} – ${fmt(end)}`;
    };
    const macroStats = [
        { label: 'Protein', value: actual.protein, target: goal?.protein_target_g || 0, icon: Beef, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', bar: 'bg-orange-500' },
        { label: 'Carbs', value: actual.carbs, target: goal?.carb_target_g || 0, icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', bar: 'bg-amber-500' },
        { label: 'Fat', value: actual.fat, target: goal?.fat_target_g || 0, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', bar: 'bg-blue-500' },
    ];

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="My Progress"
                subtitle={formatPeriodSubtitle()}
                actions={
                    <>
                        <button
                            onClick={() => setIsGoalModalOpen(true)}
                            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-sm font-semibold hover:border-vitality-300 hover:text-vitality-600 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <Edit3 className="w-4 h-4" />
                            Goals
                        </button>
                        <button
                            onClick={() => setIsMealModalOpen(true)}
                            className="px-4 py-2 bg-vitality-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-vitality-500/20 hover:bg-vitality-600 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            Log Meal
                        </button>
                    </>
                }
            />

            <div className="grid lg:grid-cols-12 gap-5">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Calorie Ring */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center justify-center">
                            <GoalProgressBar
                                current={actual.calories}
                                target={goal?.calorie_target || 2000}
                                label={`${goalTypeLabel} Budget`}
                                unit="kcal"
                                className="w-full max-w-[240px]"
                            />
                        </div>

                        {/* Steady Gains Card */}
                        <div className="bg-vitality-500 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-vitality-500/20 flex flex-col justify-center">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-vitality-200" />
                                    <span className="font-bold text-vitality-100 uppercase tracking-widest text-[10px]">{goalTypeLabel} Insight</span>
                                </div>
                                <h3 className="text-xl font-bold mb-1.5">Steady Gains! 🚀</h3>
                                <p className="text-vitality-50 text-sm leading-relaxed">
                                    You've hit {Math.round((actual.protein / (goal?.protein_target_g || 1)) * 100)}% of your protein goal.
                                    Keep it up to maintain muscle mass!
                                </p>
                            </div>
                            <Target className="absolute -right-10 -bottom-10 w-40 h-40 text-vitality-600/30 -rotate-12" />
                        </div>
                    </div>

                    {/* Macro Breakdown */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        {macroStats.map((stat) => (
                            <div key={stat.label} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:border-vitality-200 dark:hover:border-vitality-500 transition-colors group">
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(stat.value)}g</span>
                                    <span className="text-slate-400 dark:text-zinc-500 text-xs">/ {stat.target}g</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-700 ease-out", stat.bar)}
                                        style={{ width: barsMounted ? `${Math.min((stat.value / (stat.target || 1)) * 100, 100)}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Activity</h2>
                        <button className="text-xs font-semibold text-vitality-600 dark:text-vitality-400 hover:underline">View All</button>
                    </div>

                    <div className="space-y-2">
                        {!recentMeals || recentMeals.length === 0 ? (
                            <div className="bg-slate-50 dark:bg-zinc-900/50 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
                                <Utensils className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-zinc-400 font-semibold text-sm mb-1">No meals logged yet</p>
                                <p className="text-slate-400 dark:text-zinc-500 text-xs">Start tracking your nutrition!</p>
                            </div>
                        ) : (
                            recentMeals.map((meal) => (
                                <div key={meal.id} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 hover:shadow-sm transition-all group flex items-center gap-3 cursor-pointer">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex flex-col items-center justify-center group-hover:bg-vitality-50 dark:group-hover:bg-vitality-900/20 transition-colors shrink-0">
                                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-vitality-500" />
                                        <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                            {new Date(meal.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                                            {meal.meal_type}
                                            <span className="text-vitality-600 dark:text-vitality-400 text-xs font-bold">
                                                +{Math.round(meal.items.reduce((sum, i) => sum + i.calories, 0))} kcal
                                            </span>
                                        </h4>
                                        <p className="text-slate-400 dark:text-zinc-500 text-xs truncate">
                                            {meal.items.map(i => i.name).join(', ')}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── At a Glance ─────────────────────────────────────── */}
            {goal && (
                <div>
                    <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-3">At a Glance</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                        {/* Calories Remaining */}
                        {(() => {
                            const remaining = (goal.calorie_target || 0) - actual.calories;
                            const isOver = remaining < 0;
                            return (
                                <div className={cn(
                                    "p-4 rounded-2xl border flex items-start gap-3",
                                    isOver
                                        ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                                        : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                        isOver ? "bg-red-100 dark:bg-red-900/30" : "bg-vitality-50 dark:bg-vitality-900/20"
                                    )}>
                                        {isOver
                                            ? <TrendingDown className="w-4 h-4 text-red-500" />
                                            : <Zap className="w-4 h-4 text-vitality-500" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Remaining</p>
                                        <p className={cn(
                                            "text-xl font-bold mt-0.5",
                                            isOver ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
                                        )}>
                                            {isOver ? `+${Math.abs(Math.round(remaining))}` : Math.round(remaining)}
                                            <span className="text-xs font-semibold text-slate-400 ml-1">kcal</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                                            {isOver ? 'over budget' : 'left for today'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Meals Logged */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                <Coffee className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Meals Logged</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                    {recentMeals?.length ?? 0}
                                    <span className="text-xs font-semibold text-slate-400 ml-1">entries</span>
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">this period</p>
                            </div>
                        </div>

                        {/* Top Macro */}
                        {(() => {
                            const macros = [
                                { label: 'Protein', value: actual.protein, target: goal.protein_target_g || 1, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                                { label: 'Carbs', value: actual.carbs, target: goal.carb_target_g || 1, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                { label: 'Fat', value: actual.fat, target: goal.fat_target_g || 1, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                            ];
                            const top = [...macros].sort((a, b) => (b.value / b.target) - (a.value / a.target))[0];
                            const pct = Math.round((top.value / top.target) * 100);
                            return (
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
                                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", top.bg)}>
                                        <Beef className={cn("w-4 h-4", top.color)} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Leading Macro</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                            {top.label}
                                        </p>
                                        <p className={cn("text-[10px] font-bold mt-0.5", top.color)}>{pct}% of target</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Goal Status */}
                        {(() => {
                            const status = summaryData?.status;
                            const isOnTrack = status === 'met';
                            return (
                                <div className={cn(
                                    "p-4 rounded-2xl border flex items-start gap-3",
                                    isOnTrack
                                        ? "bg-vitality-50 dark:bg-vitality-900/10 border-vitality-100 dark:border-vitality-900/30"
                                        : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                        isOnTrack ? "bg-vitality-100 dark:bg-vitality-900/30" : "bg-slate-50 dark:bg-zinc-800"
                                    )}>
                                        <CheckCircle2 className={cn("w-4 h-4", isOnTrack ? "text-vitality-600" : "text-slate-400")} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Goal Status</p>
                                        <p className={cn(
                                            "text-lg font-bold mt-0.5",
                                            isOnTrack ? "text-vitality-700 dark:text-vitality-400" : "text-slate-700 dark:text-zinc-300"
                                        )}>
                                            {isOnTrack ? 'On Track ✓' : 'In Progress'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                                            {Math.round((actual.calories / (goal.calorie_target || 1)) * 100)}% of {goalTypeLabel.toLowerCase()} target
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                </div>
            )}

            <GoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                currentGoal={goal || null}
                onUpdate={refreshDashboard}
            />

            <MealModal
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                onSuccess={refreshDashboard}
            />
        </div>
    );
};
