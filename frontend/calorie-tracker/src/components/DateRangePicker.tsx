import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { cn } from '../utils/cn';

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface Props {
    value: DateRange;
    onChange: (range: DateRange) => void;
    className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isInRange(day: Date, start: Date | null, end: Date | null) {
    if (!start || !end) return false;
    const lo = start <= end ? start : end;
    const hi = start <= end ? end : start;
    return day > lo && day < hi;
}

function startOf(d: Date) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
}

function formatLabel(range: DateRange): string {
    if (!range.start && !range.end) return 'Pick date range';
    const fmt = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    if (range.start && !range.end) return `From ${fmt(range.start)}`;
    if (range.start && range.end) {
        if (isSameDay(range.start, range.end)) return fmt(range.start);
        return `${fmt(range.start)} – ${fmt(range.end)}`;
    }
    return 'Pick date range';
}

export const DateRangePicker: React.FC<Props> = ({ value, onChange, className }) => {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
    // 'start' = waiting to pick start, 'end' = waiting to pick end
    const [picking, setPicking] = useState<'start' | 'end'>('start');
    const [hovered, setHovered] = useState<Date | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const openCalendar = () => {
        setPicking('start');
        setOpen(true);
    };

    const clearRange = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ start: null, end: null });
        setPicking('start');
    };

    // Build the calendar grid for viewYear/viewMonth
    const buildGrid = () => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const cells: (Date | null)[] = Array(firstDay).fill(null);
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(new Date(viewYear, viewMonth, d));
        }
        return cells;
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const handleDayClick = (day: Date) => {
        if (picking === 'start') {
            onChange({ start: startOf(day), end: null });
            setPicking('end');
        } else {
            const start = value.start!;
            const end = startOf(day);
            // Ensure start <= end
            if (end < start) {
                onChange({ start: end, end: start });
            } else {
                onChange({ start, end });
            }
            setPicking('start');
            setOpen(false);
        }
    };

    const grid = buildGrid();
    const hasValue = value.start || value.end;

    // Effective range preview (for hover highlight while picking end)
    const effectiveEnd = picking === 'end' && hovered ? hovered : value.end;
    const effectiveStart = value.start;

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {/* Trigger button */}
            <button
                onClick={openCalendar}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all select-none',
                    hasValue
                        ? 'bg-vitality-500 text-white border-vitality-500 shadow-sm shadow-vitality-500/20'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                )}
            >
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[180px] truncate">{formatLabel(value)}</span>
                {hasValue && (
                    <span
                        onClick={clearRange}
                        className="ml-1 hover:opacity-70 shrink-0"
                    >
                        <X className="w-3 h-3" />
                    </span>
                )}
            </button>

            {/* Calendar popover */}
            {open && (
                <div className="absolute z-30 top-full mt-2 left-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/10 p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Hint */}
                    <p className="text-[10px] font-semibold text-vitality-500 uppercase tracking-wider mb-3">
                        {picking === 'start' ? 'Select start date' : 'Select end date'}
                    </p>

                    {/* Month navigator */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={prevMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-slate-400 dark:text-zinc-600 py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Date grid */}
                    <div className="grid grid-cols-7 gap-y-0.5">
                        {grid.map((day, idx) => {
                            if (!day) return <div key={`e-${idx}`} />;

                            const isStart = effectiveStart && isSameDay(day, effectiveStart);
                            const isEnd = effectiveEnd && isSameDay(day, effectiveEnd);
                            const inRange = isInRange(day, effectiveStart, effectiveEnd);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => handleDayClick(day)}
                                    onMouseEnter={() => setHovered(day)}
                                    onMouseLeave={() => setHovered(null)}
                                    className={cn(
                                        'relative h-8 w-full text-xs font-semibold transition-all select-none',
                                        // Range background fill (extends between start and end)
                                        inRange && 'bg-vitality-50 dark:bg-vitality-900/20',
                                        // Start/End circles
                                        (isStart || isEnd)
                                            ? 'bg-vitality-500 text-white rounded-full shadow-sm z-10'
                                            : inRange
                                                ? 'text-vitality-700 dark:text-vitality-300'
                                                : isToday
                                                    ? 'text-vitality-600 dark:text-vitality-400 font-bold'
                                                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full'
                                    )}
                                >
                                    {day.getDate()}
                                    {/* Today dot */}
                                    {isToday && !isStart && !isEnd && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-vitality-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <button
                            onClick={() => { onChange({ start: null, end: null }); setPicking('start'); setOpen(false); }}
                            className="text-xs font-semibold text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 transition-colors"
                        >
                            Clear
                        </button>
                        {picking === 'end' && value.start && (
                            <button
                                onClick={() => { onChange({ start: value.start, end: value.start }); setOpen(false); }}
                                className="text-xs font-semibold text-vitality-600 dark:text-vitality-400 hover:underline"
                            >
                                Use single day
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
