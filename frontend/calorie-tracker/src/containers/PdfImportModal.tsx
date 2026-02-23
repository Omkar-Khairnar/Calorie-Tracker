import React, { useState, useRef } from 'react';
import {
    FileText, Loader2, CheckCircle2,
    AlertTriangle, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { mealsService } from '../api/meals.service';
import type { ParsedMealEntry } from '../api/meals.service';
import { cn } from '../utils/cn';

type Step = 'upload' | 'parsing' | 'review' | 'importing' | 'done';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PdfImportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    // ── All hooks must be called unconditionally ──────────────────────────
    const [step, setStep] = useState<Step>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [entries, setEntries] = useState<ParsedMealEntry[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [importedCount, setImportedCount] = useState(0);
    const fileRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep('upload');
        setError(null);
        setEntries([]);
        setSelected(new Set());
        setExpandedIdx(null);
        setImportedCount(0);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const processFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError('Please upload a PDF file.');
            return;
        }
        setError(null);
        setStep('parsing');
        try {
            const parsed = await mealsService.parsePdfDiary(file);
            setEntries(parsed);
            setSelected(new Set(parsed.map((_, i) => i)));
            setStep('review');
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Failed to parse the PDF. Make sure it contains a food diary in tabular format.';
            setError(msg);
            setStep('upload');
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const toggleSelect = (i: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i); else next.add(i);
            return next;
        });
    };

    const handleImport = async () => {
        const toImport = entries.filter((_, i) => selected.has(i));
        setStep('importing');
        try {
            const result = await mealsService.bulkImport(toImport);
            setImportedCount(result.imported);
            setStep('done');
            onSuccess();
        } catch {
            setError('Import failed. Please try again.');
            setStep('review');
        }
    };

    const totalCalories = (entry: ParsedMealEntry) =>
        entry.items.reduce((s, i) => s + i.calories, 0);

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return iso; }
    };

    // ── Early return AFTER all hooks ──────────────────────────────────────
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 dark:border-zinc-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import from PDF</h2>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                            {step === 'upload' && 'Upload your food diary or nutrition export (PDF)'}
                            {step === 'parsing' && 'Analysing your PDF with AI…'}
                            {step === 'review' && `${entries.length} meals found — select which to import`}
                            {step === 'importing' && 'Saving meals…'}
                            {step === 'done' && `${importedCount} meals imported successfully!`}
                        </p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">

                    {/* ── Upload Step ───────────────────────────── */}
                    {(step === 'upload') && (
                        <div>
                            <div
                                onDrop={onDrop}
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onClick={() => fileRef.current?.click()}
                                className={cn(
                                    'border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all',
                                    isDragging
                                        ? 'border-vitality-400 bg-vitality-50 dark:bg-vitality-900/10'
                                        : 'border-slate-200 dark:border-zinc-800 hover:border-vitality-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                                )}
                            >
                                <div className="w-14 h-14 bg-vitality-50 dark:bg-vitality-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-7 h-7 text-vitality-500" />
                                </div>
                                <p className="font-bold text-slate-900 dark:text-white mb-1">Drop your PDF here</p>
                                <p className="text-sm text-slate-400 dark:text-zinc-500">or click to browse files</p>
                                <p className="text-xs text-slate-300 dark:text-zinc-700 mt-3">Supports: MyFitnessPal exports, Cronometer, Lose It!, or any tabular food diary PDF</p>
                                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={onFileChange} />
                            </div>
                            {error && (
                                <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Parsing Step ──────────────────────────── */}
                    {step === 'parsing' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-16 h-16 bg-vitality-50 dark:bg-vitality-900/20 rounded-2xl flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-vitality-500 animate-spin" />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">Analyzing PDF with Gemini AI…</p>
                            <p className="text-sm text-slate-400 dark:text-zinc-500">Extracting meal entries, this may take a few seconds</p>
                        </div>
                    )}

                    {/* ── Review Step ───────────────────────────── */}
                    {step === 'review' && (
                        <div className="space-y-3">
                            {/* Select all bar */}
                            <div className="flex items-center justify-between py-2">
                                <button
                                    onClick={() => setSelected(selected.size === entries.length ? new Set() : new Set(entries.map((_, i) => i)))}
                                    className="text-xs font-semibold text-vitality-600 dark:text-vitality-400 hover:underline"
                                >
                                    {selected.size === entries.length ? 'Deselect all' : 'Select all'}
                                </button>
                                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                                    {selected.size} of {entries.length} selected
                                </span>
                            </div>

                            {entries.map((entry, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'rounded-xl border transition-all overflow-hidden',
                                        selected.has(i)
                                            ? 'border-vitality-200 dark:border-vitality-800 bg-vitality-50/50 dark:bg-vitality-900/10'
                                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60'
                                    )}
                                >
                                    {/* Row header */}
                                    <div className="flex items-center gap-3 p-3">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleSelect(i)}
                                            className={cn(
                                                'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                                                selected.has(i)
                                                    ? 'bg-vitality-500 border-vitality-500'
                                                    : 'border-slate-300 dark:border-zinc-700'
                                            )}
                                        >
                                            {selected.has(i) && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </button>

                                        {/* Meal info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-vitality-600 dark:text-vitality-400 bg-vitality-50 dark:bg-vitality-900/30 px-2 py-0.5 rounded-lg">
                                                    {entry.meal_type}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-zinc-400">
                                                    {formatDate(entry.consumed_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                                                {entry.items.map(it => it.name).join(' · ')}
                                            </p>
                                        </div>

                                        {/* Calorie badge */}
                                        <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0">
                                            {Math.round(totalCalories(entry))} kcal
                                        </span>

                                        {/* Expand toggle */}
                                        <button
                                            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                                            className="text-slate-400 shrink-0"
                                        >
                                            {expandedIdx === i
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Expanded items */}
                                    {expandedIdx === i && (
                                        <div className="border-t border-slate-100 dark:border-zinc-800 px-3 pb-3">
                                            <table className="w-full mt-2 text-xs">
                                                <thead>
                                                    <tr className="text-slate-400 dark:text-zinc-600 text-left">
                                                        <th className="pb-1 font-semibold">Item</th>
                                                        <th className="pb-1 font-semibold text-right">Qty</th>
                                                        <th className="pb-1 font-semibold text-right">Cal</th>
                                                        <th className="pb-1 font-semibold text-right">P</th>
                                                        <th className="pb-1 font-semibold text-right">C</th>
                                                        <th className="pb-1 font-semibold text-right">F</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entry.items.map((item, j) => (
                                                        <tr key={j} className="border-t border-slate-50 dark:border-zinc-800/50">
                                                            <td className="py-1 text-slate-700 dark:text-zinc-300 font-medium">{item.name}</td>
                                                            <td className="py-1 text-right text-slate-400">{item.quantity} {item.unit}</td>
                                                            <td className="py-1 text-right font-semibold text-slate-700 dark:text-zinc-300">{Math.round(item.calories)}</td>
                                                            <td className="py-1 text-right text-orange-500">{Math.round(item.protein)}g</td>
                                                            <td className="py-1 text-right text-amber-500">{Math.round(item.carbs)}g</td>
                                                            <td className="py-1 text-right text-blue-500">{Math.round(item.fat)}g</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Importing Step ────────────────────────── */}
                    {step === 'importing' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-16 h-16 bg-vitality-50 dark:bg-vitality-900/20 rounded-2xl flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-vitality-500 animate-spin" />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">Importing meals…</p>
                        </div>
                    )}

                    {/* ── Done Step ─────────────────────────────── */}
                    {step === 'done' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-16 h-16 bg-vitality-50 dark:bg-vitality-900/20 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-vitality-500" />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">{importedCount} meals imported!</p>
                            <p className="text-sm text-slate-400 dark:text-zinc-500">Your meal log has been updated.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {(step === 'review' || step === 'done') && (
                    <div className="flex items-center justify-between gap-3 p-5 border-t border-slate-100 dark:border-zinc-800 shrink-0">
                        {step === 'review' ? (
                            <>
                                <button
                                    onClick={reset}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 transition-colors"
                                >
                                    ← Upload another
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={selected.size === 0}
                                    className="px-5 py-2 bg-vitality-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-vitality-500/20 hover:bg-vitality-600 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Import {selected.size} meal{selected.size !== 1 ? 's' : ''}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="ml-auto px-5 py-2 bg-vitality-500 text-white rounded-xl text-sm font-semibold hover:bg-vitality-600 transition-all active:scale-95"
                            >
                                Done
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
