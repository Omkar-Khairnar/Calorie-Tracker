import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Utensils, Scale, Flame, Beef, Wheat, Droplets, Loader2, Camera, Sparkles } from 'lucide-react';
import { mealsService } from '../api/meals.service';
import { aiService } from '../api/ai.service';
import type { MealLogCreate, FoodItemCreate } from '../api/meals.service';
import { cn } from '../utils/cn';

interface MealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const INITIAL_ITEM: FoodItemCreate = {
    name: '',
    quantity: 1,
    unit: 'serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
};

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];

export const MealModal: React.FC<MealModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [mealType, setMealType] = useState('Breakfast');
    const [consumedAt, setConsumedAt] = useState(new Date().toISOString().slice(0, 16));
    const [items, setItems] = useState<FoodItemCreate[]>([{ ...INITIAL_ITEM }]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setItems([{ ...INITIAL_ITEM }]);
            setError('');
        }
    }, [isOpen]);

    const addItem = () => {
        setItems([...items, { ...INITIAL_ITEM }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof FoodItemCreate, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        setError('');

        try {
            const extractedItems = await aiService.extractNutritionFromPhoto(file);
            if (extractedItems && extractedItems.length > 0) {
                // If the first item is empty, replace it; otherwise append
                if (items.length === 1 && !items[0].name) {
                    setItems(extractedItems);
                } else {
                    setItems([...items, ...extractedItems]);
                }
            } else {
                setError('Could not extract any food items from this photo.');
            }
        } catch (err: any) {
            setError('AI extraction failed. Please try manual entry.');
        } finally {
            setIsExtracting(false);
            // Clear the input so it can be re-used
            e.target.value = '';
        }
    };

    const totals = items.reduce((acc, item) => ({
        calories: acc.calories + (Number(item.calories) || 0),
        protein: acc.protein + (Number(item.protein) || 0),
        carbs: acc.carbs + (Number(item.carbs) || 0),
        fat: acc.fat + (Number(item.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const mealData: MealLogCreate = {
                meal_type: mealType,
                consumed_at: new Date(consumedAt).toISOString(),
                items: items.map(item => ({
                    ...item,
                    calories: Number(item.calories),
                    protein: Number(item.protein),
                    carbs: Number(item.carbs),
                    fat: Number(item.fat),
                    quantity: Number(item.quantity)
                }))
            };

            await mealsService.createMeal(mealData);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to log meal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 dark:border-zinc-800 transition-colors">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50 transition-colors">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Log a New Meal</h2>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Add items and track your nutrients</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-all border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* AI Extraction & Meta */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-vitality-50 dark:bg-vitality-900/10 rounded-3xl border border-vitality-100 dark:border-vitality-900/30 flex flex-col justify-center gap-4 transition-colors">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-vitality-700 dark:text-vitality-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    AI Extraction
                                </label>
                                {isExtracting && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-vitality-600 dark:text-vitality-400 animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Scanning...
                                    </span>
                                )}
                            </div>
                            <label className={cn(
                                "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer group",
                                isExtracting
                                    ? "bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 pointer-events-none"
                                    : "bg-white dark:bg-zinc-900 border-vitality-200 dark:border-vitality-900/50 hover:border-vitality-400 dark:hover:border-vitality-600 hover:bg-vitality-50/50 dark:hover:bg-vitality-900/20"
                            )}>
                                <Camera className="w-8 h-8 text-vitality-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">Upload Food Photo</span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 italic">Gemini will estimate calories & macros</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    disabled={isExtracting}
                                />
                            </label>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col justify-between gap-6 transition-colors">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Meal Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {MEAL_TYPES.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setMealType(type)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all",
                                                mealType === type
                                                    ? "bg-vitality-500 text-white shadow-lg shadow-vitality-200 dark:shadow-none"
                                                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Time Consumed</label>
                                <input
                                    type="datetime-local"
                                    value={consumedAt}
                                    onChange={(e) => setConsumedAt(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-vitality-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Food Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Food Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-xs font-bold text-vitality-600 dark:text-vitality-400 hover:text-vitality-700 dark:hover:text-vitality-300 flex items-center gap-1 bg-vitality-50 dark:bg-vitality-900/20 px-3 py-1.5 rounded-lg border border-vitality-200 dark:border-vitality-900/30 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Food Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="group relative p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl hover:border-vitality-300 dark:hover:border-vitality-600 transition-all shadow-sm">
                                    <div className="grid md:grid-cols-12 gap-4">
                                        <div className="md:col-span-5 space-y-2">
                                            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500">
                                                <Utensils className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Food Name</span>
                                            </div>
                                            <input
                                                required
                                                placeholder="e.g. Grilled Chicken Breast"
                                                value={item.name}
                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-vitality-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500">
                                                <Scale className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Qty</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                min="0.1"
                                                step="0.1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-vitality-500 transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-4 grid grid-cols-4 gap-2">
                                            {[
                                                { field: 'calories', icon: Flame, color: 'text-orange-500', label: 'kcal' },
                                                { field: 'protein', icon: Beef, color: 'text-orange-600', label: 'P' },
                                                { field: 'carbs', icon: Wheat, color: 'text-amber-500', label: 'C' },
                                                { field: 'fat', icon: Droplets, color: 'text-blue-500', label: 'F' },
                                            ].map(({ field, icon: Icon, color, label }) => (
                                                <div key={field} className="space-y-2">
                                                    <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-zinc-500">
                                                        <Icon className={cn("w-3 h-3", color)} />
                                                        <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={item[field as keyof FoodItemCreate] as number}
                                                        onChange={(e) => updateItem(index, field as keyof FoodItemCreate, e.target.value)}
                                                        className="w-full px-2 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl text-[11px] font-bold text-center text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-vitality-500 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="md:col-span-1 flex items-end justify-center pb-2">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                                className="p-2 text-slate-300 dark:text-zinc-600 hover:text-red-500 transition-colors disabled:opacity-0"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}
                </form>

                {/* Footer / Summary */}
                <div className="p-8 border-t border-slate-50 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex flex-col md:flex-row items-center gap-8 transition-colors">
                    <div className="flex-1 grid grid-cols-4 gap-4 w-full">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total Kcal</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round(totals.calories)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total P</p>
                            <p className="text-xl font-black text-orange-600 dark:text-orange-400">{Math.round(totals.protein)}g</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total C</p>
                            <p className="text-xl font-black text-amber-500 dark:text-amber-400">{Math.round(totals.carbs)}g</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total F</p>
                            <p className="text-xl font-black text-blue-500 dark:text-blue-400">{Math.round(totals.fat)}g</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 md:flex-none px-8 py-4 text-slate-500 dark:text-zinc-400 font-bold hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 md:flex-none px-12 py-4 bg-vitality-500 text-white rounded-2xl font-bold shadow-xl shadow-vitality-200 dark:shadow-none hover:bg-vitality-600 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Log Meal"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
