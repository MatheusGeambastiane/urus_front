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
  new_clients_count?: number;
  returning_clients_count?: number;
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
