import { useQuery } from '@tanstack/react-query';
import {
  getAdminSalesSummary,
  getDashboardCounts,
  getInquiryById,
  getInquiryStatusCounts,
  listInquiries,
  trackOrder,
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

export function useInquiryStatusCounts(
  filters: Omit<InquiryListFilters, 'status'> = {},
) {
  return useQuery({
    queryKey: ['inquiry_status_counts', filters],
    queryFn: () => getInquiryStatusCounts(filters),
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

export function useTrackedOrder(reference: string, phone: string, enabled: boolean) {
  return useQuery({
    queryKey: ['track_order', reference.trim(), phone.trim()],
    queryFn: () => trackOrder(reference, phone),
    enabled: enabled && Boolean(reference.trim()) && Boolean(phone.trim()),
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useAdminSalesSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['sales_summary', from, to],
    queryFn: () => getAdminSalesSummary(from, to),
    enabled: Boolean(from) && Boolean(to),
    staleTime: 0,
  });
}
