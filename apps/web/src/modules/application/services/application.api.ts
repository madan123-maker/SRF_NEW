import axios from 'axios';
import { Application, PaginatedResponse } from '../types/application.types';

// Assuming base URL is configured in axios interceptors globally, 
// otherwise we can just use the relative path if running on the same domain
const api = axios.create({
  baseURL: '/api/v1/applications',
  withCredentials: true,
});

export const ApplicationAPI = {
  getApplications: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Application>> => {
    const { data } = await api.get('/', { params });
    return data;
  },

  getApplicationDetails: async (id: string): Promise<Application> => {
    const { data } = await api.get(`/${id}`);
    return data;
  },

  createDraft: async (editionId: string): Promise<Application> => {
    const { data } = await api.post('/', { editionId });
    return data;
  },

  updateAnswers: async (id: string, answers: unknown[]): Promise<void> => {
    await api.patch(`/${id}`, { answers });
  },

  submitApplication: async (id: string): Promise<Application> => {
    const { data } = await api.post(`/${id}/submit`);
    return data;
  },

  getProgress: async (id: string): Promise<{ status: string; totalAnswered: number; completionPercentage: number | null }> => {
    const { data } = await api.get(`/${id}/progress`);
    return data;
  }
};
