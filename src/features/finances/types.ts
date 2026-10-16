export type PaymentBreakdown = {
  payment_type: string;
  total: number;
};

export type SellBreakdown = {
  transaction_payment: string;
  total: number;
};

export type FinanceRevenueForecast = {
  projected_revenue: string;
  projected_expenses: string;
  lower_bound: string;
  upper_bound: string;
  projected_appointments: number;
  appointments_lower_bound: number;
  appointments_upper_bound: number;
  projected_daily_average: string;
  daily_average_lower_bound: string;
  daily_average_upper_bound: string;
  scheduled_appointments_count: number;
  scheduled_revenue: string;
  confidence: "low" | "medium";
  as_of: string;
  methodology: "previous_month_weekday_pace";
};

export type FinanceSummary = {
  month: string;
  revenue: string;
  expenses: string;
  previous_month_period_revenue?: string;
  revenue_difference_previous_month_period?: string;
  appointments_count: number;
  new_clients_count?: number;
  returning_clients_count?: number;
  sell_transactions_count: number;
  forecast?: FinanceRevenueForecast | null;
  appointments_average_per_day?: string;
  appointments_ticket_average?: string;
  appointments_sell_ticket_average?: string;
  payment_transactions_by_resource?: {
    money_resource: string | null;
    total: number;
    count: number;
  }[];
  appointments_by_payment_type: PaymentBreakdown[];
  appointments_by_day_hour?: {
    date: string;
    hour: number;
    count: number;
  }[];
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

export type FinanceClientGroup = "new" | "returning";

export type FinanceClientAppointment = {
  id: number;
  date_time: string;
  professional_id: number | null;
  professional_name: string | null;
  services: string[];
  price_paid: string;
};

export type FinanceClientWithAppointments = {
  id: number;
  name: string;
  email: string;
  phone: string;
  appointments_count: number;
  total_spent: string;
  appointments: FinanceClientAppointment[];
};

export type FinanceClientAppointmentsResponse = {
  month: string;
  client_group: FinanceClientGroup;
  clients_count: number;
  appointments_count: number;
  clients: FinanceClientWithAppointments[];
};

export type FinancialDashboardSummary = {
  total_revenue: string;
  net_revenue: string;
  service_revenue: string;
  service_net_revenue: string;
  product_revenue: string;
  product_net_revenue: string;
  payment_fees: string;
  operating_cost: string;
  product_cost: string;
  total_cost: string;
  service_profit: string;
  product_profit: string;
  total_profit: string;
  profit_margin: string;
};

export type FinancialDashboardCosts = {
  bills: string;
  service_repasses: string;
  product_repasses: string;
  tips: string;
  allowances: string;
  product_cost: string;
  payment_fees: string;
};

export type FinancialDashboardProfessional = {
  professional_id: number;
  name: string;
  service_revenue: string;
  product_revenue: string;
  total_revenue: string;
  service_net_revenue: string;
  product_net_revenue: string;
  net_revenue: string;
  payment_fees: string;
  repasses: string;
  allowance: string;
  product_cost: string;
  contribution_profit: string;
};

export type PaymentMethodFee = {
  payment_method: "money" | "pix" | "credit" | "debit";
  label: string;
  rate: string;
};

export type FinancialDashboardPaymentMethod = PaymentMethodFee & {
  gross_revenue: string;
  fee_amount: string;
  net_revenue: string;
};

export type FinancialDashboardData = {
  period: {
    mode: "month" | "range";
    month: string | null;
    start_date: string;
    end_date: string;
  };
  summary: FinancialDashboardSummary;
  costs: FinancialDashboardCosts;
  payment_methods: FinancialDashboardPaymentMethod[];
  professionals: FinancialDashboardProfessional[];
};
