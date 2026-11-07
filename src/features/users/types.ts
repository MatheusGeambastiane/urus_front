export type RoleOption = {
  value: string;
  label: string;
};

export type ProfessionalProfile = {
  professional_type: string | null;
};

export type ProfessionalProfileServiceItem = {
  id: number;
  name: string;
  category: number;
  category_name: string;
};

export type ProfessionalInterval = {
  id: number;
  professional: number;
  date_start: string | null;
  date_finish: string | null;
  hour_start: string;
  hour_finish: string;
  week_days: number[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProfessionalProfileDetail = {
  id: number;
  professional_type: string;
  cnpj: string;
  commission: number;
  bio: string;
  services: number[];
  active_professional_intervals: ProfessionalInterval[];
};

export type AuthenticatedProfessionalProfile = {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    role_display: string;
    is_active: boolean;
    date_of_birth: string;
  };
  professional_type: string;
  cnpj: string;
  commission: number;
  bio: string;
  services: ProfessionalProfileServiceItem[];
  active_professional_intervals: ProfessionalInterval[];
  created_at: string;
  updated_at: string;
};

export type HistoryItem = {
  id: number;
  name: string;
  count: number;
};

export type ClientHistorySummary = {
  total_appointments: number;
  total_paid_completed: string;
  appointments_by_professional: HistoryItem[];
  appointments_by_service: HistoryItem[];
};

export type UserAppointment = {
  id: number;
  date_time: string;
  start_datetime: string | null;
  finish_datetime: string | null;
  professional: number | null;
  professional_name: string | null;
  services: Array<{
    id: number;
    name: string;
    category: number;
    category_name: string;
  }>;
  price_paid: string;
  tips: string | null;
  discount: number;
  payment_type: string;
  status: "agendado" | "iniciado" | "realizado" | "cancelado";
  status_display: string;
  appointment_origin: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
};

export type UserDetail = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  cpf: string;
  phone: string;
  role: string;
  role_display: string;
  is_active: boolean;
  is_unregistered_client: boolean;
  date_of_birth: string | null;
  profile_pic: string | null;
  professional_profile: ProfessionalProfileDetail | null;
  appointments?: UserAppointment[];
};

export type AuthenticatedUserProfile = {
  id: number;
  first_name: string;
  last_name: string;
  cpf: string;
  email: string;
  phone: string;
  role: string;
  role_display: string;
  is_active: boolean;
  is_unregistered_client: boolean;
  date_of_birth: string | null;
  profile_pic: string | null;
  created_at: string;
  updated_at: string;
  professional_profile: AuthenticatedProfessionalProfile | null;
};

export type UserItem = {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string;
  is_unregistered_client?: boolean;
  profile_pic: string | null;
  professional_profile?: ProfessionalProfile | null;
};

export type UsersResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserItem[];
};
