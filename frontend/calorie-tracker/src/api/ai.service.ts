import api from './axios';

export interface AIChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export const aiService = {
    extractNutritionFromPhoto: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/ai/extract-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    chat: async (query: string, history: AIChatMessage[] = []) => {
        const response = await api.post('/ai/chat', {
            query,
            history
        });
        return response.data.response;
    }
};
