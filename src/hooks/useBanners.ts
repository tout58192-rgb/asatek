import { useQuery } from '@tanstack/react-query';
import { listBanners } from '../services/banners';

export function useBanners(includeInactive = false) {
  return useQuery({
    queryKey: ['home_banners', { includeInactive }],
    queryFn: () => listBanners(includeInactive),
    staleTime: includeInactive ? 0 : 5 * 60 * 1000,
  });
}
