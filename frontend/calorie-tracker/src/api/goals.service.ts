import api from './axios';

export interface GoalsPage {
    items: any[];
    total: number;
    skip: number;
    limit: number;
}

export const goalsService = {
    getActiveGoal: async () => {
        const response = await api.get('/goals/active');
        return response.data;
    },

    createGoal: async (goalData: any) => {
        const response = await api.post('/goals/', goalData);
        return response.data;
    },

    getHistory: async (skip: number = 0, limit: number = 10): Promise<GoalsPage> => {
        const response = await api.get('/goals/history', {
            params: { skip, limit }
        });
        return response.data;
    },

    deactivateGoal: async (id: string) => {
        const response = await api.patch(`/goals/${id}/deactivate`);
        return response.data;
    }
};
