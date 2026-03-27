export type RoleOption = {
  value: string;
  label: string;
};

export type ProfessionalProfile = {
  professional_type: string | null;
};

export type ProfessionalProfileDetail = {
  id: number;
  professional_type: string;
  cnpj: string;
  commission: number;
  bio: string;
  services: number[];
};

export type ProfessionalProfileServiceItem = {
  id: number;
  name: string;
  category: number;
  category_name: string;
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
  date_of_birth: string;
  profile_pic: string | null;
  professional_profile: ProfessionalProfileDetail | null;
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
  date_of_birth: string;
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
  profile_pic: string | null;
  professional_profile?: ProfessionalProfile | null;
};

export type UsersResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserItem[];
};
