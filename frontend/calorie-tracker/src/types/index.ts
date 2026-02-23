export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface HealthGoal {
    id: string;
    user_id: string;
    goal_type: GoalType;
    calorie_target: number;
    protein_target_g: number;
    carb_target_g: number;
    fat_target_g: number;
    weight_target_kg?: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface FoodItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    micros?: Record<string, any>;
}

export interface MealLog {
    id: string;
    user_id: string;
    meal_type: string;
    consumed_at: string;
    items: FoodItem[];
}

export interface DailySummary {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface ReportSummary {
    actual: DailySummary;
    goal: HealthGoal | null;
    period_start: string;
    period_end: string;
    status: 'met' | 'over' | 'no_goal';
}
