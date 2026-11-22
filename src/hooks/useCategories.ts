import { useQuery } from '@tanstack/react-query';
import { listCategories } from '../services/categories';

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: ['categories', { includeInactive }],
    queryFn: () => listCategories(includeInactive),
    staleTime: includeInactive ? 0 : 5 * 60 * 1000,
  });
}
