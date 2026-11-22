import { useQuery } from '@tanstack/react-query';
import {
  getProductById,
  getProductBySlug,
  listRelatedProducts,
} from '../services/products';

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ['product', 'id', id],
    queryFn: () => getProductById(id!),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useRelatedProducts(
  categoryId: string | undefined,
  excludeProductId: string | undefined,
) {
  return useQuery({
    queryKey: ['products', 'related', categoryId, excludeProductId],
    queryFn: () => listRelatedProducts(categoryId!, excludeProductId!, 4),
    enabled: Boolean(categoryId && excludeProductId),
    staleTime: 5 * 60 * 1000,
  });
}
