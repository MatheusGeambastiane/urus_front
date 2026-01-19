export type RepasseItem = {
  id: number;
  professional: {
    id: number;
    name: string;
    user_id: number;
  };
  value_service: string;
  value_product: string;
  is_paid: boolean;
  invoice: string | null;
  month: string;
  created_at: string;
  updated_at: string;
};

export type RepasseTransaction = {
  id: number;
  type: string;
  price: string;
  date_of_transaction: string;
  transaction_payment: string;
  payment_proof: string | null;
  product: number | null;
  quantity: number;
  user: number;
  bill: number | null;
  created_at: string;
  updated_at: string;
};

export type RepasseDetail = {
  id: number;
  professional: {
    id: number;
    user_id: number;
    name: string;
    email: string;
    professional_type: string;
  };
  value_service: string;
  value_product: string;
  is_paid: boolean;
  transactions: RepasseTransaction[];
  invoice: string | null;
  month: string;
  created_at: string;
  updated_at: string;
};

export type ProfessionalServiceSummary = {
  professional: {
    id: number;
    user_id: number;
    name: string;
    professional_type: string;
  };
  period: {
    month: string;
    start: string;
    end: string;
  };
  totals: {
    service_revenue: string;
    sales_revenue: string;
    overall_revenue: string;
    repass_value_service?: string;
    repass_value_product?: string;
    appointments_count: number;
    services_performed: number;
  };
  services_breakdown: {
    service_id: number;
    service_name: string;
    total: number;
  }[];
  categories_breakdown: {
    category_id: number;
    category_name: string;
    total: number;
  }[];
};
