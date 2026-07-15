import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../utils/api.utils';

export const useSchemaMutations = () => {
  const queryClient = useQueryClient();

  const invalidateKeys = (type: string) => {
    if (type === 'REFORM_AREA') queryClient.invalidateQueries({ queryKey: ['reform-areas'] });
    if (type === 'ACTION_POINT') queryClient.invalidateQueries({ queryKey: ['action-points'] });
    if (type === 'QUESTION') queryClient.invalidateQueries({ queryKey: ['questions'] });
    if (type === 'FORM_FIELD') queryClient.invalidateQueries({ queryKey: ['form-fields'] });
  };

  const getEndpoint = (type: string, id?: string) => {
    let base = '';
    switch (type) {
      case 'REFORM_AREA': base = '/reform-areas'; break;
      case 'ACTION_POINT': base = '/action-points'; break;
      case 'QUESTION': base = '/questions'; break;
      case 'FORM_FIELD': base = '/form-fields'; break;
      default: base = '';
    }
    return id ? `${base}/${id}` : base;
  };

  const createNode = useMutation({
    mutationFn: ({ type, data }: { type: string, data: Record<string, unknown> }) => 
      fetchApi(getEndpoint(type), {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (_, variables) => {
      invalidateKeys(variables.type);
    }
  });

  const updateNode = useMutation({
    mutationFn: ({ type, id, data }: { type: string, id: string, data: Record<string, unknown> }) => 
      fetchApi(getEndpoint(type, id), {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: (_, variables) => {
      invalidateKeys(variables.type);
    }
  });

  const deleteNode = useMutation({
    mutationFn: ({ type, id }: { type: string, id: string }) => 
      fetchApi(getEndpoint(type, id), { method: 'DELETE' }),
    onSuccess: (_, variables) => {
      invalidateKeys(variables.type);
    }
  });

  return {
    createNode,
    updateNode,
    deleteNode
  };
};
