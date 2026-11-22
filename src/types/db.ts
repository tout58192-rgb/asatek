export type UserRole = 'user' | 'admin';

export type AvailabilityStatus = 'in_stock' | 'made_to_order' | 'out_of_stock';

export type InquiryType = 'quote' | 'contact';

export type InquiryChannel = 'website' | 'whatsapp';

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'dispatched'
  | 'completed'
  | 'skipped'
  | 'cancelled'
  | 'closed';

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
  status_updated_at?: string | null;
  confirmed_at?: string | null;
  total_amount?: number | null;
  skip_reason?: string | null;
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

export interface TrackedOrderItem {
  product_id?: string | null;
  product_name: string;
  sku?: string | null;
  quantity: number;
  unit_price: number | null;
}

export interface TrackedOrder {
  reference: string;
  status: InquiryStatus;
  created_at: string;
  status_updated_at: string | null;
  skip_reason: string | null;
  total_amount: number | null;
  items: TrackedOrderItem[];
}

export interface SalesSummaryTotals {
  orders: number;
  new_orders: number;
  skipped_orders: number;
  cancelled_orders?: number;
  confirmed_orders: number;
  revenue: number;
  avg_order_value: number;
}

export interface SalesSummaryDailyPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface SalesSummaryMonthlyPoint {
  month: string;
  orders: number;
  revenue: number;
}

export interface SalesSummaryTopProduct {
  name: string;
  qty: number;
  revenue: number;
}

export interface SalesSummaryTrendingProduct {
  name: string;
  qty: number;
  orders: number;
}

export interface SalesSummaryByStatus {
  status: InquiryStatus;
  orders: number;
}

export interface SalesSummaryByChannel {
  channel: InquiryChannel;
  orders: number;
  revenue: number;
}

export interface SalesSummaryByCity {
  city: string;
  orders: number;
  revenue: number;
}

export interface AdminSalesSummary {
  range: {
    from: string;
    to: string;
  };
  totals: SalesSummaryTotals;
  daily: SalesSummaryDailyPoint[];
  monthly: SalesSummaryMonthlyPoint[];
  top_products: SalesSummaryTopProduct[];
  trending_products: SalesSummaryTrendingProduct[];
  by_status: SalesSummaryByStatus[];
  by_channel: SalesSummaryByChannel[];
  by_city: SalesSummaryByCity[];
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
  anonymous?: boolean;
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
  new_orders: number;
  new_inquiries: number;
  inquiries_last_7_days: number;
}

export interface HomeBanner {
  id: string;
  image_url: string;
  title_en: string | null;
  title_ur: string | null;
  subtitle_en: string | null;
  subtitle_ur: string | null;
  button_text_en: string | null;
  button_text_ur: string | null;
  button_link: string | null;
  sort_order: number;
  is_active: boolean;
}
