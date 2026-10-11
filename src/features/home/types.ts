export type SummaryPaymentSplit = {
  payment_type: string;
  total: number;
};

export type SummarySellPaymentSplit = {
  transaction_payment: string;
  total: number;
};

export type SummaryNextAppointment = {
  id: number;
  date_time: string;
  client_id: number;
  client_name: string;
  professional_id: number;
  professional_name: string;
};

export type SummaryProfessionalBreakdown = {
  professional_id: number;
  professional_name: string;
  total: number;
};

export type SummaryServiceHighlight = {
  service_id: number;
  service_name: string;
  total: number;
};

export type SummaryProductSale = {
  product_id: number;
  product_name: string;
  quantity: number;
  total_value: string;
};

export type DailySummaryComparisonMetric = {
  current: string;
  compared: string;
  difference: string;
  percentage: string | null;
};

export type SummaryComparisonMetrics = {
  revenue: string;
  appointments_value: string;
  sell_value: string;
  total_appointments: number | string;
  total_services_performed: number | string;
};

export type DailySummaryComparedDay = {
  date: string;
  period: {
    type: string;
    start: string;
    end: string;
  };
  metrics: {
    revenue: string;
    appointments_value: string;
    sell_value: string;
    total_appointments: number | string;
    total_services_performed: number | string;
  };
};

type SummaryComparisonBase = {
  current_period: {
    type: string;
    start: string;
    end: string;
    metrics: SummaryComparisonMetrics;
  };
  compared_average: SummaryComparisonMetrics;
  variation: {
    revenue: DailySummaryComparisonMetric;
    appointments_value: DailySummaryComparisonMetric;
    sell_value: DailySummaryComparisonMetric;
    total_appointments: DailySummaryComparisonMetric;
    total_services_performed: DailySummaryComparisonMetric;
  };
};

export type SameWeekdaySummaryComparison = SummaryComparisonBase & {
  type: "same_weekday_in_month";
  weekday: number;
  weekday_name: string;
  compared_days: DailySummaryComparedDay[];
  compared_days_count: number;
};

export type SummaryComparedPeriod = {
  type: string;
  start: string;
  end: string;
  metrics: SummaryComparisonMetrics;
};

export type PreviousMonthsSummaryComparison = SummaryComparisonBase & {
  type: "two_previous_months_average" | "same_ordinal_week_average";
  mode: SummaryComparisonMode;
  ordinal_week: number | null;
  compared_periods: SummaryComparedPeriod[];
  compared_periods_count: number;
};

export type DailySummaryComparison =
  | SameWeekdaySummaryComparison
  | PreviousMonthsSummaryComparison;

export type DailySummaryResponse = {
  period: {
    type: string;
    start: string;
    end: string;
  };
  filters: {
    day: string | null;
    month: string | null;
  };
  revenue: string;
  appointments_value: string;
  sell_value: string;
  total_appointments: number;
  total_services_performed: number;
  appointments_by_payment_type: SummaryPaymentSplit[];
  sell_by_payment_type: SummarySellPaymentSplit[];
  next_appointment: SummaryNextAppointment | null;
  appointments_by_professional: SummaryProfessionalBreakdown[];
  top_services: SummaryServiceHighlight[];
  top_products: SummaryProductSale[];
  comparison?: DailySummaryComparison | null;
};

export type QuickActionKey =
  | "create-appointment"
  | "create-professional-interval"
  | "create-product-sale"
  | "create-product";

export type SummaryFilterMode = "day" | "month" | "range";
export type SummaryComparisonMode = "days" | "weeks";

export type HomeWeeklyFilter = {
  day: string | null;
  month: string | null;
  startDate: string | null;
  endDate: string | null;
};
