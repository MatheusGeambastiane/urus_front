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
  previous_month_period_revenue?: string;
  revenue_difference_previous_month_period?: string;
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

export type ServiceSummaryItem = {
  service_name: string;
  total: number;
};

export type ServiceProfessionalDistribution = {
  professional_id: number;
  professional_name: string;
  count: number;
  percentage: string;
};

export type FinanceServicesSummary = {
  month: string;
  period: {
    start: string;
    end: string;
  };
  services: ServiceSummaryItem[];
  professionals: ServiceProfessionalDistribution[];
};
