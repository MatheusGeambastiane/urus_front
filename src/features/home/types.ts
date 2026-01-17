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
  total_services_performed: number;
  appointments_by_payment_type: SummaryPaymentSplit[];
  sell_by_payment_type: SummarySellPaymentSplit[];
  next_appointment: SummaryNextAppointment | null;
  appointments_by_professional: SummaryProfessionalBreakdown[];
  top_services: SummaryServiceHighlight[];
};

export type QuickActionKey = "create-appointment" | "create-product-sale" | "create-product";
