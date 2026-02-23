import React, { useState } from 'react';
import { X, Save, Target, Activity, Flame, Loader2 } from 'lucide-react';
import type { HealthGoal, GoalType } from '../types';
import { goalsService } from '../api/goals.service';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoal: HealthGoal | null;
    onUpdate: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, currentGoal, onUpdate }) => {
    const [goalType, setGoalType] = useState<GoalType>(currentGoal?.goal_type || 'daily');
    const [calories, setCalories] = useState(currentGoal?.calorie_target || 2000);
    const [protein, setProtein] = useState(currentGoal?.protein_target_g || 150);
    const [carbs, setCarbs] = useState(currentGoal?.carb_target_g || 200);
    const [fat, setFat] = useState(currentGoal?.fat_target_g || 65);
    const [weight, setWeight] = useState(currentGoal?.weight_target_kg || 75);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await goalsService.createGoal({
                goal_type: goalType,
                calorie_target: calories,
                protein_target_g: protein,
                carb_target_g: carbs,
                fat_target_g: fat,
                weight_target_kg: weight,
                start_date: new Date().toISOString(),
            });
            onUpdate();
            onClose();
        } catch (err) {
            console.error('Failed to update goal', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-vitality-100 dark:bg-vitality-900/40 rounded-xl">
                            <Target className="w-4 h-4 text-vitality-600 dark:text-vitality-400" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Set Health Goals</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-400 dark:text-zinc-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Goal type selector */}
                    <div className="flex gap-2">
                        {(['daily', 'weekly', 'monthly'] as GoalType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setGoalType(type)}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${goalType === type
                                    ? 'bg-vitality-500 border-vitality-500 text-white shadow-md shadow-vitality-500/20'
                                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-vitality-300 dark:hover:border-vitality-600'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Input fields */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Calories — full width */}
                        <div className="col-span-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                                <Flame className="w-3.5 h-3.5 text-orange-500" />
                                Daily Calorie Target
                            </label>
                            <input
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-vitality-500 outline-none font-bold text-base transition-colors placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Protein (g)</label>
                            <input
                                type="number"
                                value={protein}
                                onChange={(e) => setProtein(Number(e.target.value))}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-vitality-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Carbs (g)</label>
                            <input
                                type="number"
                                value={carbs}
                                onChange={(e) => setCarbs(Number(e.target.value))}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-vitality-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Fat (g)</label>
                            <input
                                type="number"
                                value={fat}
                                onChange={(e) => setFat(Number(e.target.value))}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-vitality-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                <Activity className="w-3 h-3 text-vitality-500" />
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-vitality-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-vitality-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-vitality-500/20 hover:bg-vitality-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Update Active Goal
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
