export type ServiceOption = {
  id: number;
  name: string;
};

export type ServiceSimpleOption = {
  id: number;
  name: string;
  price: string;
};

export type ProductUsage = {
  id: number;
  product: number;
  product_name: string;
  quantity_used: number;
};

export type ServiceItem = {
  id: number;
  name: string;
  price: string;
  category: number;
  category_name: string;
  duration: string;
  service_photo: string | null;
  is_active: boolean;
  product_usages?: ProductUsage[];
};

export type ServicesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceItem[];
};

export type ServiceCategoryOption = {
  id: number;
  name: string;
};

export type ProfessionalSimple = {
  id: number;
  user_name: string;
};
