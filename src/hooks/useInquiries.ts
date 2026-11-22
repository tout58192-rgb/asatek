import { useQuery } from '@tanstack/react-query';
import {
  getDashboardCounts,
  getInquiryById,
  listInquiries,
  type InquiryListFilters,
} from '../services/inquiries';

export function useInquiries(filters: InquiryListFilters = {}) {
  return useQuery({
    queryKey: ['inquiries', filters],
    queryFn: () => listInquiries(filters),
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useInquiry(id: string | undefined) {
  return useQuery({
    queryKey: ['inquiry', id],
    queryFn: () => getInquiryById(id!),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useDashboardCounts() {
  return useQuery({
    queryKey: ['dashboard_counts'],
    queryFn: getDashboardCounts,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}
