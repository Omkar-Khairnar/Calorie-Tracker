import api from './axios';

export const reportsService = {
    getDailySummary: async (date?: string) => {
        const response = await api.get('/reports/daily-summary', {
            params: { target_date: date }
        });
        return response.data;
    },

    getWeeklyTrend: async () => {
        const response = await api.get('/reports/weekly-trend');
        return response.data;
    },

    getMacrosBreakdown: async (startDate: string, endDate: string) => {
        const response = await api.get('/reports/macros-breakdown', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    getMicrosSummary: async (startDate: string, endDate: string) => {
        const response = await api.get('/reports/micros-summary', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    }
};
