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
  appointments_average_per_day?: string;
  appointments_ticket_average?: string;
  appointments_sell_ticket_average?: string;
  payment_transactions_by_resource?: {
    money_resource: string | null;
    total: number;
    count: number;
  }[];
  appointments_by_payment_type: PaymentBreakdown[];
  sell_by_payment_type: SellBreakdown[];
};
