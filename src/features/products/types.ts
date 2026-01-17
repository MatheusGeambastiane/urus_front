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

export type ProductSalePaymentType = "pix" | "creditcard" | "debit" | "money";

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
  productId: number;
  productName: string;
  price: string;
  quantity: number;
  paymentType: PaymentType;
};
