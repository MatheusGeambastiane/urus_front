export type PaymentBreakdown = {
  payment_type: string;
  total: number;
};

export type SellBreakdown = {
  transaction_payment: string;
  total: number;
};

export type FinanceSummary = {
  month: string;
  revenue: string;
  expenses: string;
  appointments_count: number;
  sell_transactions_count: number;
  appointments_by_payment_type: PaymentBreakdown[];
  sell_by_payment_type: SellBreakdown[];
};
