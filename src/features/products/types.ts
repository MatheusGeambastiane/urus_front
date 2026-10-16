import type { PaymentType } from "@/src/shared/types/payment";

export type ProductItem = {
  id: number;
  name: string;
  price_paid: string;
  quantity: number;
  use_type: string;
  type: string;
  price_to_sell: string;
  commission: number | null;
  picture_of_product: string | null;
  alarm_quantity: number;
  next_to_finish: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductItem[];
};

export type ProductSalePaymentType = PaymentType;

export type ProductSaleListItem = {
  id?: number;
  name: string;
  image: string | null;
  price: string;
  payment: ProductSalePaymentType | string;
  date: string;
  user_name: string | null;
};

export type ProductSalesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductSaleListItem[];
};

export type AddedSaleItem = {
  saleId?: number;
  productId: number;
  productName: string;
  price: string;
  quantity: number;
  paymentType: PaymentType;
  userId?: number | null;
};

export type ProductSalesDashboardProduct = {
  product_id: number | null;
  name: string;
  type: string;
  type_label: string;
  quantity: number;
  sales_count: number;
  revenue: string;
  cost: string;
  commission: string;
  profit: string;
};

export type ProductSalesDashboard = {
  period: {
    mode: "month" | "range";
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: string;
    total_cost: string;
    total_commission: string;
    total_profit: string;
    sales_count: number;
    items_sold: number;
  };
  sales_by_product_type: Array<{
    type: string;
    label: string;
    revenue: string;
    quantity: number;
  }>;
  top_sellers: Array<{
    user_id: number | null;
    name: string;
    revenue: string;
    sales_count: number;
    items_sold: number;
  }>;
  top_customers: Array<{
    customer_id: number;
    name: string;
    amount_spent: string;
    transactions_count: number;
    items_bought: number;
  }>;
  sales_by_day_hour: Array<{
    date: string;
    hour: number;
    count: number;
  }>;
  top_products_by_revenue: ProductSalesDashboardProduct[];
  top_products_by_profit: ProductSalesDashboardProduct[];
  products: ProductSalesDashboardProduct[];
};
