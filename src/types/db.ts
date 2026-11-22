export type UserRole = 'user' | 'admin';

export type AvailabilityStatus = 'in_stock' | 'made_to_order' | 'out_of_stock';

export type InquiryType = 'quote' | 'contact';

export type InquiryChannel = 'website' | 'whatsapp';

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ur: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  sku: string;
  name_en: string;
  name_ur: string | null;
  short_desc_en: string | null;
  short_desc_ur: string | null;
  moq: number;
  availability: AvailabilityStatus;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductPriceTier {
  id: string;
  product_id: string;
  min_qty: number;
  unit_price: number;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  label_en: string;
  label_ur: string | null;
  value_en: string;
  value_ur: string | null;
  sort_order: number;
}

export interface ProductWithDetails extends Product {
  category?: Category | null;
  images: ProductImage[];
  price_tiers: ProductPriceTier[];
  specs: ProductSpec[];
}

export interface Inquiry {
  id: string;
  reference: string;
  type: InquiryType;
  channel: InquiryChannel;
  name: string;
  phone: string;
  city: string | null;
  business_name: string | null;
  message: string | null;
  status: InquiryStatus;
  admin_note: string | null;
  created_at: string;
}

export interface InquiryItem {
  id: string;
  inquiry_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number | null;
}

export interface InquiryWithItems extends Inquiry {
  items: InquiryItem[];
}

export interface SiteSettingRow {
  key: string;
  value_en: string | null;
  value_ur: string | null;
  updated_at: string;
}

export type SiteSettingsMap = Record<
  string,
  {
    value_en: string;
    value_ur: string;
  }
>;

export type ProductSort = 'newest' | 'name_asc' | 'price_asc';

export interface ProductListParams {
  categorySlug?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubmitInquiryPayload {
  type: InquiryType;
  channel: InquiryChannel;
  name: string;
  phone: string;
  city?: string;
  business_name?: string;
  message?: string;
  items?: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export interface SubmitInquiryResult {
  id: string;
  reference: string;
}

export interface DashboardCounts {
  total_products: number;
  active_products: number;
  new_inquiries: number;
  inquiries_last_7_days: number;
}
