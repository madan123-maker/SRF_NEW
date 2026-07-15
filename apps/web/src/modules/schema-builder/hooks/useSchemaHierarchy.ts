import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../utils/api.utils';
import { Edition, ReformArea, ActionPoint, Question, FormField } from '../types/schema.types';

export const useEditions = () => {
  return useQuery({
    queryKey: ['editions'],
    queryFn: () => fetchApi<{ data: Edition[] }>('/editions').then(res => res.data || [])
  });
};

export const useEditionDetails = (editionId?: string) => {
  return useQuery({
    queryKey: ['edition', editionId],
    queryFn: () => fetchApi<Edition>(`/editions/${editionId}`),
    enabled: !!editionId
  });
};

export const useReformAreas = (editionId?: string) => {
  return useQuery({
    queryKey: ['reform-areas', editionId],
    queryFn: () => fetchApi<{ data: ReformArea[] }>(`/reform-areas?editionId=${editionId}`).then(res => res.data || []),
    enabled: !!editionId
  });
};

export const useActionPoints = (reformAreaId?: string) => {
  return useQuery({
    queryKey: ['action-points', reformAreaId],
    queryFn: () => fetchApi<{ data: ActionPoint[] }>(`/action-points?reformAreaId=${reformAreaId}`).then(res => res.data || []),
    enabled: !!reformAreaId
  });
};

export const useQuestions = (actionPointId?: string) => {
  return useQuery({
    queryKey: ['questions', actionPointId],
    queryFn: () => fetchApi<{ data: Question[] }>(`/action-points/${actionPointId}/questions`).then(res => res.data || []),
    enabled: !!actionPointId
  });
};

export const useFormFields = (questionId?: string) => {
  return useQuery({
    queryKey: ['form-fields', questionId],
    queryFn: () => fetchApi<{ data: FormField[] }>(`/questions/${questionId}/form-fields`).then(res => res.data || []),
    enabled: !!questionId
  });
};
