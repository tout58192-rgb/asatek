import { useQuery } from '@tanstack/react-query';
import { getCachedSiteSettings, getSiteSettings } from '../services/settings';

export function useSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    queryFn: getSiteSettings,
    initialData: getCachedSiteSettings,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000,
  });
}
