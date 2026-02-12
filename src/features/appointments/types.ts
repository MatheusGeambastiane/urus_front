import type { ServiceOption } from "@/src/features/services/types";

export type AppointmentProfessionalSlot = {
  id: string;
  professional: ServiceOption | null;
};

export type ServiceAssignment = {
  professionalSlotId: string | null;
  price: string;
};

export type AppointmentStatus = "realizado" | "agendado" | "cancelado" | "iniciado";

export type AppointmentService = {
  id: number;
  name: string;
  category_name: string;
};

export type AppointmentProfessionalService = {
  professional: number;
  professional_name?: string;
  service: number;
  service_name?: string;
  price_paid: string;
};

export type AppointmentSell = {
  id: number;
  type: string;
  price: string;
  date_of_transaction: string;
  transaction_payment: string;
  money_resource: string | null;
  payment_proof: string | null;
  product: number | null;
  product_name?: string | null;
  quantity: number;
  user: number | null;
  user_name?: string | null;
  appointment: number | null;
  bill: number | null;
  created_at?: string;
  updated_at?: string;
};

export type AppointmentItem = {
  id: number;
  date_time: string;
  client: number | null;
  professional: number | null;
  services: AppointmentService[];
  price_paid: string;
  discount: number | null;
  payment_type: string | null;
  status: string;
  observations: string | null;
  professional_name: string | null;
  client_name: string | null;
  professional_services?: AppointmentProfessionalService[];
  sells?: AppointmentSell[];
  created_at?: string;
  updated_at?: string;
  appointment_origin?: string | null;
};

export type AppointmentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AppointmentItem[];
  completed_total_price: string;
  completed_total_count: number;
  day_restriction: {
    id: number;
    start_datetime: string;
    finish_datetime: string;
    is_all_day: boolean;
  } | null;
};

export type Last7DaysItem = {
  day: number;
  date: string;
  count: number;
};

export type Last7DaysResponse = {
  last_7_days: Last7DaysItem[];
  top_day_in_month: Last7DaysItem | null;
};
