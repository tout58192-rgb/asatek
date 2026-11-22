import { useQuery } from '@tanstack/react-query';
import { listFeaturedProducts, listProducts } from '../services/products';
import type { ProductListParams } from '../types/db';

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => listProducts(params),
    staleTime: params.includeInactive ? 0 : 5 * 60 * 1000,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => listFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
}
