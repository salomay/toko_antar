import { QueryKey } from 'react-query';
export type PaginatorInfo = {
  /** Number of items in the current page. */
  count: number;
  /** Index of the current page. */
  currentPage: number;
  /** Index of the first item in the current page. */
  firstItem?: number;
  /** Are there more pages after this one? */
  hasMorePages: boolean;
  /** Index of the last item in the current page. */
  lastItem?: number;
  /** Index of the last available page. */
  lastPage: number;
  /** Number of items per page. */
  perPage: number;
  /** Number of total available items. */
  total: number;
  nextPageUrl: string;
};
export type CategoriesQueryOptionsType = {
  type: string;
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
  parent?: string | null;
};
export type ProductsQueryOptionsType = {
  type?: string;
  name?: string;
  categories?: string;
  status?: string;
  limit?: number;
  shop_id?: number;
};

export type ShopsQueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
  is_active?: number;
};
export type OrdersQueryOptionsType = {
  tracking_number?: string;
  orderBy?: string;
  sortedBy?: string;
  customer_id?: number;
  shop_id?: number;
  first?: number;
  page?: number;
  fields?: string[];
};

export type QueryParamsType = {
  queryKey: QueryKey;
  pageParam?: string;
};
export type Banner = {
  title: string;
  description: string;
  image: {
    id: string;
    original: string;
    thumbnail: string;
  };
};
export declare type Type = {
  id: number | string;
  name: string;
  slug: string;
  icon: string;
  banners: Banner[];
  promotional_sliders: any[];
  settings: {
    isHome: boolean;
    layoutType: string;
    productCard: string;
  };
  // products?: Maybe<ProductPaginator>;
  created_at: Date;
  updated_at: Date;
};
export declare type Coupon = {
  id: number | string;
  code: string;
  description: string;
  // orders: Order[];
  type: string;
  image: string;
  amount: number;
  active_from: Date;
  expire_at: Date;
  created_at: Date;
  updated_at: Date;
};
export declare type Category = {
  id: number | string;
  name: string;
  slug: string;
  parent?: number;
  parent_id?: number;
  products_count?: number;
  children: Category[];
  details?: string;
  image?: Attachment;
  icon?: string;
  type: Type;
  products: Product[];
  created_at: Date;
  updated_at: Date;
};
export declare type Attachment = {
  id?: number | string;
  thumbnail?: string;
  original?: string;
};
export declare type AttributeValue = {
  id: string;
};
export declare type Variation = {
  id: string;
  options?: any;
};
export declare type Product = {
  id?: number | string;
  name?: string;
  slug?: string;
  type?: Type;
  categories?: Category[];
  variations: AttributeValue[];
  variation_options: Variation[];
  // pivot?: OrderProductPivot
  // orders: Order[]
  shop?: any;
  description?: string;
  in_stock?: boolean;
  is_taxable?: boolean;
  sale_price?: number;
  sku?: string;
  gallery?: Attachment[];
  image?: Attachment;
  // status?: ProductStatus
  height?: string;
  length?: string;
  width?: string;
  price?: number;
  min_price?: number;
  max_price?: number;
  related_products?: Product[];
  quantity?: number;
  unit?: string;
  created_at?: Date;
  updated_at?: Date;
};

export declare type UserAddress = {
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export declare type Order = {
  id: number | string;
  tracking_number: string;
  customer_id: number | string;
  // customer?: Maybe<User>;
  // status: OrderStatus;
  amount: number;
  children: Order[];
  sales_tax: number;
  total: number;
  paid_total: number;
  payment_id?: string;
  payment_gateway?: string;
  coupon?: Coupon;
  discount?: number;
  delivery_fee?: number;
  delivery_time: string;
  products: Product[];
  created_at: Date;
  updated_at: Date;
  billing_address?: UserAddress;
  shipping_address?: UserAddress;
};
export enum RefundStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  PROCESSING = 'Processing',
}
export declare type User = {
  id: number | string;
  name: string;
  email: string;
  [key: string]: any;
};
export declare type Refund = {
  id: number | string;
  amount: string;
  status: RefundStatus;
  shop: Shop;
  order: Order;
  customer: User;
  created_at: Date;
  updated_at: Date;
};

export type SettingsType = {
  id: number | string;
  options: SettingsOptions;
};

export type SettingsOptions = {
  siteTitle?: string;
  siteSubtitle?: string;
  currency?: string;
  logo?: Attachment;
  taxClass?: string;
  shippingClass?: string;
  contactDetails?: any;
};

export type Shop = {
  [key: string]: any;
};

export type Address = {
  [key: string]: any;
};
