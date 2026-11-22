import { useQuery } from '@tanstack/react-query';
import { getSiteSettings } from '../services/settings';

export function useSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  });
}
