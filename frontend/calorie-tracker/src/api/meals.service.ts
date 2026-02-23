import api from './axios';
import type { MealLog } from '../types';

export interface FoodItemCreate {
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    micros?: Record<string, any>;
}

export interface MealLogCreate {
    meal_type: string;
    consumed_at?: string;
    items: FoodItemCreate[];
}

export interface MealsPage {
    items: MealLog[];
    total: number;
    skip: number;
    limit: number;
}

export interface ParsedMealEntry {
    meal_type: string;
    consumed_at: string;
    items: {
        name: string;
        quantity: number;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }[];
}

export const mealsService = {
    createMeal: async (mealData: MealLogCreate): Promise<MealLog> => {
        const response = await api.post('/meals/', mealData);
        return response.data;
    },

    getMeals: async (params?: {
        start_date?: string;
        end_date?: string;
        meal_type?: string;
        skip?: number;
        limit?: number;
    }): Promise<MealsPage> => {
        const response = await api.get('/meals/', { params });
        return response.data;
    },

    getMeal: async (id: string): Promise<MealLog> => {
        const response = await api.get(`/meals/${id}`);
        return response.data;
    },

    updateMeal: async (id: string, mealData: any): Promise<MealLog> => {
        const response = await api.put(`/meals/${id}`, mealData);
        return response.data;
    },

    deleteMeal: async (id: string): Promise<MealLog> => {
        const response = await api.delete(`/meals/${id}`);
        return response.data;
    },

    parsePdfDiary: async (file: File): Promise<ParsedMealEntry[]> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/ai/parse-pdf-diary', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    bulkImport: async (meals: ParsedMealEntry[]): Promise<{ imported: number }> => {
        const response = await api.post('/meals/bulk-import', meals);
        return response.data;
    },
};
