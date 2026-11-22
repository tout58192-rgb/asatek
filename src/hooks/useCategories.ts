import { useQuery } from '@tanstack/react-query';
import { getCachedCategories, listCategories } from '../services/categories';

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: ['categories', { includeInactive }],
    queryFn: () => listCategories(includeInactive),
    initialData: includeInactive ? undefined : getCachedCategories,
    initialDataUpdatedAt: includeInactive ? undefined : 0,
    staleTime: includeInactive ? 0 : 5 * 60 * 1000,
  });
}
