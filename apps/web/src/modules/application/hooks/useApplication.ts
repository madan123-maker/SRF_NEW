import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApplicationAPI } from '../services/application.api';
import { Application, PaginatedResponse } from '../types/application.types';

export const useApplications = (params?: Record<string, unknown>) => {
  return useQuery<PaginatedResponse<Application>, Error>({
    queryKey: ['applications', params],
    queryFn: () => ApplicationAPI.getApplications(params),
  });
};

export const useApplicationDetails = (id: string) => {
  return useQuery<Application, Error>({
    queryKey: ['application', id],
    queryFn: () => ApplicationAPI.getApplicationDetails(id),
    enabled: !!id,
  });
};

export const useCreateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (editionId: string) => ApplicationAPI.createDraft(editionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ApplicationAPI.submitApplication(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};
