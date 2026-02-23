import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Utensils, Calendar, Search,
    Filter, Plus, Loader2,
    Trash2, ChevronDown, ChevronUp, X, FileUp
} from 'lucide-react';
import { mealsService } from '../api/meals.service';
import type { MealsPage } from '../api/meals.service';
import { Pagination } from '../components/Pagination';
import { DateRangePicker } from '../components/DateRangePicker';
import type { DateRange } from '../components/DateRangePicker';
import { MealModal } from '../containers/MealModal';
import { PdfImportModal } from '../containers/PdfImportModal';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Skeleton, SkeletonText, SkeletonCard } from '../components/Skeleton';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import type { MealLog } from '../types';
import { cn } from '../utils/cn';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];

type DatePreset = 'all' | 'today' | 'yesterday' | 'week';

function getDateRange(preset: DatePreset): { start_date?: string; end_date?: string } {
    const now = new Date();
    if (preset === 'today') {
        const start = new Date(now); start.setHours(0, 0, 0, 0);
        const end = new Date(now); end.setHours(23, 59, 59, 999);
        return { start_date: start.toISOString(), end_date: end.toISOString() };
    }
    if (preset === 'yesterday') {
        const start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
        const end = new Date(now); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999);
        return { start_date: start.toISOString(), end_date: end.toISOString() };
    }
    if (preset === 'week') {
        const start = new Date(now); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
        return { start_date: start.toISOString(), end_date: new Date(now).toISOString() };
    }
    return {};
}

export const MealsView: React.FC = () => {
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [datePreset, setDatePreset] = useState<DatePreset>('all');
    const [customRange, setCustomRange] = useState<DateRange>({ start: null, end: null });
    const [mealTypeFilter, setMealTypeFilter] = useState<string>('');
    const [showMealTypeMenu, setShowMealTypeMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 15;
    const queryClient = useQueryClient();

    // When a custom range is set, clear the preset; when a preset is chosen, clear the custom range
    const handleDatePreset = (val: DatePreset) => {
        setDatePreset(val);
        setCustomRange({ start: null, end: null });
        setCurrentPage(1);
    };
    const handleCustomRange = (range: DateRange) => {
        setCustomRange(range);
        if (range.start || range.end) setDatePreset('all'); // neutral preset
        setCurrentPage(1);
    };
    const handleMealTypeFilter = (val: string) => { setMealTypeFilter(val); setCurrentPage(1); };

    // Build the effective date range params for the API
    const effectiveDateRange = useMemo(() => {
        if (customRange.start || customRange.end) {
            const params: Record<string, string> = {};
            if (customRange.start) {
                const s = new Date(customRange.start); s.setHours(0, 0, 0, 0);
                params.start_date = s.toISOString();
            }
            if (customRange.end) {
                const e = new Date(customRange.end); e.setHours(23, 59, 59, 999);
                params.end_date = e.toISOString();
            }
            return params;
        }
        return getDateRange(datePreset);
    }, [customRange, datePreset]);

    const skip = (currentPage - 1) * PAGE_SIZE;
    const hasCustomRange = !!(customRange.start || customRange.end);

    const { data: mealsPage, isLoading } = useQuery<MealsPage>({
        queryKey: ['meals', datePreset, customRange, mealTypeFilter, currentPage],
        queryFn: () => mealsService.getMeals({
            ...effectiveDateRange,
            meal_type: mealTypeFilter || undefined,
            skip,
            limit: PAGE_SIZE,
        }),
    });

    const meals = mealsPage?.items ?? [];
    const totalMeals = mealsPage?.total ?? 0;
    const totalPages = Math.ceil(totalMeals / PAGE_SIZE);

    // Client-side search filter on top of server-side date/type filters
    const filteredMeals = useMemo(() => {
        if (!searchQuery.trim()) return meals;
        const q = searchQuery.toLowerCase();
        return meals.filter(meal =>
            meal.meal_type.toLowerCase().includes(q) ||
            meal.items.some(item => item.name.toLowerCase().includes(q))
        );
    }, [meals, searchQuery]);

    const activeFiltersCount = (datePreset !== 'all' ? 1 : 0) + (mealTypeFilter ? 1 : 0) + (hasCustomRange ? 1 : 0);

    const toggleMeal = (id: string) => {
        setExpandedMealId(expandedMealId === id ? null : id);
    };

    const handleDeleteMeal = async (id: string) => {
        setIsDeletingId(id);
        try {
            await mealsService.deleteMeal(id);
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
        } catch (err) {
            console.error('Failed to delete meal', err);
        } finally {
            setIsDeletingId(null);
            setPendingDeleteId(null);
        }
    };

    const showSkeleton = useDelayedLoading(isLoading);

    if (showSkeleton) {
        return (
            <div className="space-y-4">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-36" />
                        <SkeletonText width="w-64" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                </div>
                {/* Filter bar skeleton */}
                <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
                {/* Meal card skeletons */}
                <div className="space-y-3">
                    {[0, 1, 2, 3, 4].map(i => (
                        <SkeletonCard key={i} className="p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <SkeletonText width="w-1/3" className="h-4" />
                                    <SkeletonText width="w-1/2" />
                                </div>
                                <Skeleton className="w-16 h-5" />
                            </div>
                        </SkeletonCard>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Meal History"
                subtitle="Review and manage your nutritional entries"
                actions={
                    <>
                        <button
                            onClick={() => setIsPdfModalOpen(true)}
                            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-sm font-semibold hover:border-vitality-300 hover:text-vitality-600 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <FileUp className="w-4 h-4" />
                            Import PDF
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

            {/* Filters/Search */}
            <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search meals or food items..."
                        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-vitality-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Date Presets + Meal Type Filter */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date pill group */}
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1">
                        {([['all', 'All'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['week', '7 Days']] as [DatePreset, string][]).map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => handleDatePreset(val)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                    datePreset === val
                                        ? "bg-vitality-500 text-white shadow-sm"
                                        : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Custom date range picker */}
                    <DateRangePicker
                        value={customRange}
                        onChange={handleCustomRange}
                    />

                    {/* Meal type dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMealTypeMenu(v => !v)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
                                mealTypeFilter
                                    ? "bg-vitality-500 text-white border-vitality-500"
                                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            {mealTypeFilter || 'Meal Type'}
                            {mealTypeFilter && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); handleMealTypeFilter(''); }}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X className="w-3 h-3" />
                                </span>
                            )}
                        </button>
                        {showMealTypeMenu && (
                            <div className="absolute z-20 top-full mt-1.5 left-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                                {MEAL_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { handleMealTypeFilter(type === mealTypeFilter ? '' : type); setShowMealTypeMenu(false); }}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors",
                                            mealTypeFilter === type
                                                ? "bg-vitality-50 dark:bg-vitality-900/20 text-vitality-600"
                                                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active filter summary */}
                    {(activeFiltersCount > 0 || searchQuery) && (
                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                            {searchQuery ? filteredMeals.length : totalMeals} result{(searchQuery ? filteredMeals.length : totalMeals) !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Meals List */}
            <div className="space-y-2">
                {filteredMeals.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-14 text-center">
                        <div className="w-14 h-14 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Utensils className="w-7 h-7 text-slate-300 dark:text-zinc-700" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {activeFiltersCount > 0 || searchQuery ? 'No meals match your filters' : 'Your plate is empty'}
                        </h3>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-xs mx-auto mb-5">
                            {activeFiltersCount > 0 || searchQuery
                                ? 'Try adjusting your date range, meal type, or search query.'
                                : 'Start recording your meals to see a detailed history here.'}
                        </p>
                        {!activeFiltersCount && !searchQuery && (
                            <button
                                onClick={() => setIsMealModalOpen(true)}
                                className="text-vitality-600 font-semibold text-sm hover:underline"
                            >
                                Log your first meal now
                            </button>
                        )}
                    </div>
                ) : (
                    filteredMeals.map((meal) => {
                        const totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
                        const isExpanded = expandedMealId === meal.id;

                        return (
                            <div
                                key={meal.id}
                                className={cn(
                                    "bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 transition-all overflow-hidden",
                                    isExpanded ? "ring-2 ring-vitality-100 dark:ring-vitality-900/30 shadow-sm" : "hover:border-slate-200 dark:hover:border-zinc-700"
                                )}
                            >
                                <div
                                    onClick={() => toggleMeal(meal.id)}
                                    className="p-4 cursor-pointer flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-vitality-50 dark:bg-vitality-900/20 rounded-xl flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[9px] font-bold text-vitality-600 dark:text-vitality-400 uppercase leading-tight">
                                                {new Date(meal.consumed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-[9px] font-semibold text-vitality-400 dark:text-vitality-500">
                                                {new Date(meal.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{meal.meal_type}</h3>
                                            <p className="text-slate-500 dark:text-zinc-400 text-xs">
                                                {meal.items.length} item{meal.items.length !== 1 ? 's' : ''} · {Math.round(totalCalories)} kcal
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="hidden lg:flex items-center gap-3">
                                            {[
                                                { label: 'P', val: meal.items.reduce((s, i) => s + i.protein, 0), color: 'text-orange-500' },
                                                { label: 'C', val: meal.items.reduce((s, i) => s + i.carbs, 0), color: 'text-amber-500' },
                                                { label: 'F', val: meal.items.reduce((s, i) => s + i.fat, 0), color: 'text-blue-500' },
                                            ].map(stat => (
                                                <div key={stat.label} className="text-center">
                                                    <p className="text-[8px] font-bold text-slate-300 dark:text-zinc-600 tracking-widest leading-none mb-0.5">{stat.label}</p>
                                                    <p className={cn("text-xs font-bold", stat.color)}>{Math.round(stat.val)}g</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(meal.id); }}
                                                disabled={isDeletingId === meal.id}
                                                className="p-1.5 text-slate-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isDeletingId === meal.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                                    : <Trash2 className="w-4 h-4" />}
                                            </button>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-slate-50 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                                        <div className="space-y-1.5">
                                            <h4 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1 mb-2">Item Breakdown</h4>
                                            {meal.items.map((item, idx) => (
                                                <div key={idx} className="bg-slate-50 dark:bg-zinc-800/40 rounded-xl p-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
                                                            <Utensils className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{item.name}</p>
                                                            <p className="text-xs text-slate-500 dark:text-zinc-400">{item.quantity} {item.unit}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-right">
                                                        <div className="w-10">
                                                            <p className="text-[8px] font-bold text-slate-300 dark:text-zinc-600 uppercase">kcal</p>
                                                            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{Math.round(item.calories)}</p>
                                                        </div>
                                                        <div className="w-8">
                                                            <p className="text-[8px] font-bold text-slate-300 dark:text-zinc-600">P</p>
                                                            <p className="text-xs font-bold text-orange-500">{Math.round(item.protein)}g</p>
                                                        </div>
                                                        <div className="w-8">
                                                            <p className="text-[8px] font-bold text-slate-300 dark:text-zinc-600">C</p>
                                                            <p className="text-xs font-bold text-amber-500">{Math.round(item.carbs)}g</p>
                                                        </div>
                                                        <div className="w-8">
                                                            <p className="text-[8px] font-bold text-slate-300 dark:text-zinc-600">F</p>
                                                            <p className="text-xs font-bold text-blue-500">{Math.round(item.fat)}g</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                        Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, totalMeals)} of {totalMeals} meals
                    </p>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <MealModal
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['meals'] })}
            />

            <PdfImportModal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                onSuccess={() => {
                    setCurrentPage(1);
                    queryClient.invalidateQueries({ queryKey: ['meals'] });
                }}
            />

            <ConfirmDialog
                open={!!pendingDeleteId}
                onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
                title="Delete this meal?"
                description="This will permanently remove the meal and all its food items. This action cannot be undone."
                confirmLabel="Delete Meal"
                variant="danger"
                isLoading={!!isDeletingId}
                onConfirm={() => { if (pendingDeleteId) handleDeleteMeal(pendingDeleteId); }}
            />
        </div>
    );
};
