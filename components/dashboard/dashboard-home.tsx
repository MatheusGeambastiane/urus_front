"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
  Gem,
  Home,
  Loader2,
  LogOut,
  Package,
  PenSquare,
  Plus,
  DollarSign,
  Coins,
  CreditCard,
  QrCode,
  Scissors,
  Search,
  Sparkles,
  X,
  FileText,
  UserRound,
  Users,
  Wallet,
  Waves,
  Trash2,
} from "lucide-react";
import { env } from "@/lib/env";

type DashboardHomeProps = {
  firstName: string;
};

type NavKey =
  | "home"
  | "agenda"
  | "services"
  | "products"
  | "users"
  | "finances";

type RoleOption = {
  value: string;
  label: string;
};

type ProfessionalProfile = {
  professional_type: string | null;
};

type ServiceOption = {
  id: number;
  name: string;
};

type ServiceSimpleOption = {
  id: number;
  name: string;
  price: string;
};

type AppointmentProfessionalSlot = {
  id: string;
  professional: ServiceOption | null;
};

type ServiceAssignment = {
  professionalSlotId: string | null;
  price: string;
};

type PaymentType = "credit" | "debit" | "pix" | "dinheiro";

type AppointmentStatus = "realizado" | "agendado" | "iniciado";

type ProfessionalProfileDetail = {
  id: number;
  professional_type: string;
  cnpj: string;
  commission: number;
  bio: string;
  services: number[];
};

type HistoryItem = {
  id: number;
  name: string;
  count: number;
};

type ClientHistorySummary = {
  total_appointments: number;
  total_paid_completed: string;
  appointments_by_professional: HistoryItem[];
  appointments_by_service: HistoryItem[];
};

type ProductUsage = {
  id: number;
  product: number;
  product_name: string;
  quantity_used: number;
};

type ServiceItem = {
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

type ServicesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceItem[];
};

type ServiceCategoryOption = {
  id: number;
  name: string;
};

type ProfessionalSimple = {
  id: number;
  user_name: string;
};

type AppointmentService = {
  id: number;
  name: string;
  category_name: string;
};

type AppointmentProfessionalService = {
  professional: number;
  professional_name?: string;
  service: number;
  service_name?: string;
  price_paid: string;
};

type AppointmentItem = {
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
  created_at?: string;
  updated_at?: string;
};

type PaymentBreakdown = {
  payment_type: string;
  total: number;
};

type SellBreakdown = {
  transaction_payment: string;
  total: number;
};

type FinanceSummary = {
  month: string;
  revenue: string;
  expenses: string;
  appointments_count: number;
  sell_transactions_count: number;
  appointments_by_payment_type: PaymentBreakdown[];
  sell_by_payment_type: SellBreakdown[];
};

type RepasseItem = {
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

type BillItem = {
  id: number;
  name: string;
  bill_type: string;
  value: string;
  is_paid: boolean;
  date_of_payment: string;
};

type AppointmentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AppointmentItem[];
  completed_total_price: string;
  completed_total_count: number;
};

type UserDetail = {
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

type UserItem = {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string;
  profile_pic: string | null;
  professional_profile?: ProfessionalProfile | null;
};

type UsersResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserItem[];
};

type ProductItem = {
  id: number;
  name: string;
  price_paid: string;
  quantity: number;
  use_type: string;
  type: string;
  price_to_sell: string;
  commission: number | null;
  picture_of_product: string | null;
  alarm_quantity: number;
  next_to_finish: boolean;
  created_at: string;
  updated_at: string;
};

type ProductsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductItem[];
};

type ProductSalePaymentType = "pix" | "creditcard" | "debit" | "money";

type AddedSaleItem = {
  productId: number;
  productName: string;
  price: string;
  quantity: number;
  paymentType: PaymentType;
};

type SummaryPaymentSplit = {
  payment_type: string;
  total: number;
};

type SummarySellPaymentSplit = {
  transaction_payment: string;
  total: number;
};

type SummaryNextAppointment = {
  id: number;
  date_time: string;
  client_id: number;
  client_name: string;
  professional_id: number;
  professional_name: string;
};

type SummaryProfessionalBreakdown = {
  professional_id: number;
  professional_name: string;
  total: number;
};

type SummaryServiceHighlight = {
  service_id: number;
  service_name: string;
  total: number;
};

type DailySummaryResponse = {
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

type QuickActionKey = "create-appointment" | "create-product-sale" | "create-product";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const createUserDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  cpf: "",
  phone: "",
  role: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

const editUserDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  cpf: "",
  phone: "",
  role: "",
  dateOfBirth: "",
  isActive: true,
  profilePic: undefined as FileList | undefined,
};

const professionalProfileDefaultValues = {
  professionalType: "",
  cnpj: "",
  commission: "",
  bio: "",
  services: [] as number[],
};

const professionalTypeOptions = [
  { value: "barbeiro", label: "Barbeiro" },
  { value: "massoterapeuta", label: "Massoterapeuta" },
];

const createServiceDefaultValues = {
  name: "",
  price: "",
  category: "",
  duration: "00:30:00",
  isActive: true,
  productUsage: [] as { product: number; quantity_used: number; product_name?: string }[],
};

const usersEndpointBase = `${env.apiBaseUrl}/dashboard/users/`;
const roleChoicesEndpoint = `${env.apiBaseUrl}/dashboard/users/role-choices/`;
const servicesSimpleListEndpoint = `${env.apiBaseUrl}/dashboard/services/simple-list/`;
const professionalProfilesEndpointBase = `${env.apiBaseUrl}/dashboard/professional-profiles/`;
const servicesEndpointBase = `${env.apiBaseUrl}/dashboard/services/`;
const serviceCategoriesEndpoint = `${env.apiBaseUrl}/dashboard/service-categories/simple-list/`;
const productUsagesEndpointBase = `${env.apiBaseUrl}/dashboard/product-usages/`;
const appointmentsEndpointBase = `${env.apiBaseUrl}/dashboard/appointments/`;
const professionalProfilesSimpleListEndpoint = `${env.apiBaseUrl}/dashboard/professional-profiles/simple-list/`;
const productsEndpointBase = `${env.apiBaseUrl}/dashboard/products/`;
const transactionsEndpointBase = `${env.apiBaseUrl}/dashboard/transactions/`;
const clientsEndpointBase = `${env.apiBaseUrl}/dashboard/users/clients/`;
const financeSummaryEndpoint = `${env.apiBaseUrl}/dashboard/summary/`;
const repassesEndpoint = `${env.apiBaseUrl}/dashboard/repasses/`;
const billsEndpointBase = `${env.apiBaseUrl}/dashboard/bills/`;

const formatDisplayDate = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 8);
  const parts: string[] = [];

  if (digitsOnly.length >= 2) {
    parts.push(digitsOnly.slice(0, 2));
  } else if (digitsOnly.length > 0) {
    parts.push(digitsOnly);
  }

  if (digitsOnly.length >= 4) {
    parts.push(digitsOnly.slice(2, 4));
  } else if (digitsOnly.length > 2) {
    parts.push(digitsOnly.slice(2));
  }

  if (digitsOnly.length > 4) {
    parts.push(digitsOnly.slice(4));
  }

  return parts.join("/");
};

const convertDisplayDateToIso = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) {
    return null;
  }
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4);
  return `${year}-${month}-${day}`;
};

const passwordRequirementLabels = {
  length: "Pelo menos 8 caracteres",
  uppercase: "Uma letra maiúscula",
  lowercase: "Uma letra minúscula",
  number: "Um número",
  special: "Um caractere especial",
} as const;

const passwordRequirementCheck = (password: string) =>
  ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }) satisfies Record<keyof typeof passwordRequirementLabels, boolean>;

const meetsAllPasswordRequirements = (password: string) => {
  const checks = passwordRequirementCheck(password);
  return Object.values(checks).every(Boolean);
};

const categoryIconMap: Record<string, LucideIcon> = {
  cortes: Scissors,
  corte: Scissors,
  barba: Gem,
  massagem: Waves,
  combo: Package,
};

const getServiceIcon = (categoryName: string) => {
  if (!categoryName) {
    return Sparkles;
  }
  const key = categoryName.toLowerCase();
  return categoryIconMap[key] ?? Sparkles;
};

const formatCurrency = (price: string) => {
  const numeric = Number(price);
  if (Number.isNaN(numeric)) {
    return price;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeric);
};

const parseCurrencyInput = (value: string) => {
  if (!value) {
    return 0;
  }
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const capitalizeFirstLetter = (value: string) => {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatMoneyInputValue = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  const numeric = Number(digits) / 100;
  if (Number.isNaN(numeric)) {
    return "";
  }
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const normalizeMoneyValue = (value: string) => {
  if (!value) {
    return "0";
  }
  return parseCurrencyInput(value).toFixed(2);
};

const formatMoneyFromDecimalString = (value: string) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return "";
  }
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generateUniqueId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

const createProfessionalSlot = (): AppointmentProfessionalSlot => ({
  id: generateUniqueId(),
  professional: null,
});

const getDefaultServicePrice = (price: string | number | null | undefined) => {
  const parsed = parseCurrencyInput(String(price ?? 0));
  return Number.isNaN(parsed) ? "0.00" : parsed.toFixed(2);
};

const formatTimeInputValue = (dateValue: Date) => {
  const hours = dateValue.getHours().toString().padStart(2, "0");
  const minutes = dateValue.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatMonthParam = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

const getMonthLabel = (monthValue: string) => {
  const [year, month] = monthValue.split("-");
  if (!year || !month) {
    return "Mês atual";
  }
  const parsedDate = new Date(Number(year), Number(month) - 1, 1);
  return parsedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

const getSellPaymentLabel = (value: string | null | undefined) => {
  if (!value) {
    return "Desconhecido";
  }
  switch (value) {
    case "creditcard":
    case "credit":
      return "Cartão de crédito";
    case "debit":
      return "Cartão de débito";
    case "pix":
      return "Pix";
    case "dinheiro":
    case "money":
      return "Dinheiro";
    default:
      return value;
  }
};

const formatIsoToDisplay = (iso: string) => {
  if (!iso) {
    return "";
  }
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) {
    return "";
  }
  return `${day}/${month}/${year}`;
};

const buildDateTimeISOString = (date: string, time: string) => {
  if (!date || !time) {
    return null;
  }
  const dateTimeString = `${date}T${time}`;
  const instance = new Date(dateTimeString);
  if (Number.isNaN(instance.getTime())) {
    return null;
  }
  return instance.toISOString();
};

const formatDurationLabel = (duration: string) => {
  const [rawHours, rawMinutes, rawSeconds] = duration
    .split(":")
    .map((part) => Number(part));
  const hours = Number.isNaN(rawHours) ? 0 : rawHours;
  const minutes = Number.isNaN(rawMinutes) ? 0 : rawMinutes;
  const seconds = Number.isNaN(rawSeconds) ? 0 : rawSeconds;
  const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
  if (totalMinutes >= 60) {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) {
      return `${hrs}h`;
    }
    return `${hrs}h ${mins}min`;
  }
  return `${totalMinutes}min`;
};

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDatePillLabel = (date: Date, today: Date) => {
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  if (isToday) {
    return "Hoje";
  }
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekday = weekdays[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  return `${weekday}, ${day}`;
};

const priceStatusColor = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "realizado" || normalized === "completed") {
    return "text-emerald-400";
  }
  if (normalized === "iniciado" || normalized === "started") {
    return "text-sky-400";
  }
  return "text-amber-300";
};

const createUserSchema = z
  .object({
    firstName: z.string().min(1, "Informe o primeiro nome."),
    lastName: z.string().min(1, "Informe o sobrenome."),
    email: z.string().email("Informe um e-mail válido."),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    role: z.string().min(1, "Selecione uma função."),
    dateOfBirth: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato dd/mm/aaaa."),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .refine(
        (value) => /[A-Z]/.test(value),
        "Inclua pelo menos uma letra maiúscula.",
      )
      .refine(
        (value) => /[a-z]/.test(value),
        "Inclua pelo menos uma letra minúscula.",
      )
      .refine((value) => /\d/.test(value), "Inclua pelo menos um número.")
      .refine(
        (value) => /[^A-Za-z0-9]/.test(value),
        "Inclua pelo menos um caractere especial.",
      ),
    confirmPassword: z.string().min(1, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  })
  .refine((data) => meetsAllPasswordRequirements(data.password), {
    message:
      "A senha deve ter ao menos 8 caracteres, letras maiúsculas, minúsculas, números e caracteres especiais.",
    path: ["password"],
  });

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const editUserSchema = z.object({
  firstName: z.string().min(1, "Informe o primeiro nome."),
  lastName: z.string().min(1, "Informe o sobrenome."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.string().min(1, "Selecione uma função."),
  dateOfBirth: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato dd/mm/aaaa."),
  isActive: z.boolean().default(true),
  profilePic: z
    .any()
    .optional()
    .refine(
      (value) =>
        !value ||
        (typeof FileList !== "undefined" &&
          value instanceof FileList &&
          value.length <= 1),
      "Envie apenas um arquivo.",
    ),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

const professionalProfileSchema = z.object({
  professionalType: z.string().min(1, "Selecione o tipo."),
  cnpj: z.string().min(1, "Informe o CNPJ."),
  commission: z
    .string()
    .min(1, "Informe a comissão.")
    .refine((value) => !Number.isNaN(Number(value)), "Informe um número válido."),
  bio: z.string().optional(),
  services: z.array(z.number()),
});

type ProfessionalProfileFormValues = z.infer<typeof professionalProfileSchema>;

const createServiceSchema = z.object({
  name: z.string().min(1, "Informe o nome do serviço."),
  price: z.string().min(1, "Informe o preço."),
  category: z.string().min(1, "Selecione a categoria."),
  duration: z.string().min(1, "Informe a duração."),
  isActive: z.boolean().default(true),
  productUsage: z
    .array(
      z.object({
        product: z.number().min(1, "Selecione um produto."),
        quantity_used: z
          .number()
          .min(1, "Quantidade deve ser positiva."),
        product_name: z.string().optional(),
      }),
    )
    .optional(),
});

type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

const createProductSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto."),
  pricePaid: z.string().min(1, "Informe o preço de custo."),
  priceToSell: z.string().min(1, "Informe o preço de venda."),
  quantity: z
    .string()
    .min(1, "Informe a quantidade.")
    .refine((value) => !Number.isNaN(Number(value)), "Informe um número válido."),
  useType: z.string().min(1, "Selecione o tipo de uso."),
  type: z.string().min(1, "Selecione o tipo."),
  alarmQuantity: z
    .string()
    .min(1, "Informe o limite de estoque.")
    .refine((value) => !Number.isNaN(Number(value)), "Informe um número válido."),
  picture: z
    .any()
    .optional()
    .refine(
      (value) =>
        !value ||
        (typeof FileList !== "undefined" &&
          value instanceof FileList &&
          value.length <= 1),
      "Envie apenas um arquivo.",
    ),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

const createProductDefaultValues: CreateProductFormValues = {
  name: "",
  pricePaid: "",
  priceToSell: "",
  quantity: "",
  useType: "",
  type: "",
  alarmQuantity: "",
  picture: undefined,
};

const bottomNavItems: {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "agenda", label: "Agenda", icon: Calendar },
  { key: "services", label: "Serviços", icon: Scissors },
  { key: "products", label: "Produtos", icon: Package },
  { key: "users", label: "Usuários", icon: Users },
  { key: "finances", label: "Financeiro", icon: Wallet },
];

const appointmentStatusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: "agendado", label: "Agendado" },
  { value: "iniciado", label: "Iniciado" },
  { value: "realizado", label: "Realizado" },
];

const pieChartColors = ["#F97066", "#7F56D9", "#12B76A", "#FDB022", "#2E90FA"];

const paymentTypeOptions: { value: PaymentType; label: string; icon: LucideIcon }[] = [
  { value: "credit", label: "Cartão de crédito", icon: CreditCard },
  { value: "debit", label: "Cartão de débito", icon: Wallet },
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "dinheiro", label: "Dinheiro", icon: Coins },
];

const getPaymentTypeLabel = (value: PaymentType | null | undefined) => {
  if (!value) {
    return "";
  }
  return paymentTypeOptions.find((option) => option.value === value)?.label ?? value;
};

const productUseFilterOptions = [
  { label: "Todos", value: null },
  { label: "Interno", value: "interno" },
  { label: "Venda", value: "venda" },
];

const productTypeFilterOptions = [
  { label: "Todos", value: null },
  { label: "Insumo", value: "insumo" },
  { label: "Produto capilar", value: "produto_capilar" },
  { label: "Bens", value: "bens" },
  { label: "Alimento", value: "alimento" },
  { label: "Bebida", value: "bebida" },
];

const productSalePaymentOptions: {
  value: ProductSalePaymentType;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "creditcard", label: "Cartão de crédito", icon: CreditCard },
  { value: "debit", label: "Cartão de débito", icon: Wallet },
  { value: "money", label: "Dinheiro", icon: Coins },
];

const productUseOptions = [
  { value: "interno", label: "Interno" },
  { value: "venda", label: "Venda" },
];

const productTypeOptionsForm = [
  { value: "insumo", label: "Insumo" },
  { value: "produto_capilar", label: "Produto capilar" },
  { value: "bens", label: "Bens" },
  { value: "alimento", label: "Alimento" },
  { value: "bebida", label: "Bebida" },
];

const summaryFilterMonthOptions = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export function DashboardHome({ firstName }: DashboardHomeProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? null;
  const [activeTab, setActiveTab] = useState<NavKey>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZE_OPTIONS[number]>(
    PAGE_SIZE_OPTIONS[0],
  );
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [usersEndpoint, setUsersEndpoint] = useState(() => {
    const url = new URL(usersEndpointBase);
    url.searchParams.set("page_size", PAGE_SIZE_OPTIONS[0].toString());
    return url.toString();
  });
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [roleOptionsError, setRoleOptionsError] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const datePickerRef = useRef<HTMLInputElement & { showPicker?: () => void }>(null);
  const editDatePickerRef = useRef<HTMLInputElement & { showPicker?: () => void }>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);
  const [servicesOptions, setServicesOptions] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [canEditUser, setCanEditUser] = useState(false);
  const [showClientHistory, setShowClientHistory] = useState(false);
  const [clientHistoryData, setClientHistoryData] = useState<ClientHistorySummary | null>(null);
  const [clientHistoryLoading, setClientHistoryLoading] = useState(false);
  const [clientHistoryError, setClientHistoryError] = useState<string | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryOption[]>([]);
  const [serviceCategoriesError, setServiceCategoriesError] = useState<string | null>(null);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [servicesFetchError, setServicesFetchError] = useState<string | null>(null);
  const [servicesSearchInput, setServicesSearchInput] = useState("");
  const [servicesSearchTerm, setServicesSearchTerm] = useState("");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<number | null>(null);
  const [servicesLoadingList, setServicesLoadingList] = useState(false);
  const [servicesRefreshToken, setServicesRefreshToken] = useState(0);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [productsList, setProductsList] = useState<ServiceOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [selectedProductCandidate, setSelectedProductCandidate] = useState<number | null>(null);
  const [productQuantityInput, setProductQuantityInput] = useState("1");
  const [productModalContext, setProductModalContext] = useState<"create" | "service-detail" | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [serviceDetail, setServiceDetail] = useState<(ServiceItem & { product_usages: ProductUsage[] }) | null>(null);
  const [serviceDetailLoading, setServiceDetailLoading] = useState(false);
  const [serviceDetailError, setServiceDetailError] = useState<string | null>(null);
  const [canEditService, setCanEditService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [isAddingProductUsage, setIsAddingProductUsage] = useState(false);
  const [productUsageDeletingId, setProductUsageDeletingId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [appointmentsSummary, setAppointmentsSummary] = useState({
    completed_total_price: "0",
    completed_total_count: 0,
  });
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentItem | null>(null);
  const [appointmentDetailLoading, setAppointmentDetailLoading] = useState(false);
  const [appointmentDetailError, setAppointmentDetailError] = useState<string | null>(null);
  const [appointmentDetailRefreshToken, setAppointmentDetailRefreshToken] = useState(0);
  const [appointmentStatusUpdating, setAppointmentStatusUpdating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startDateFilter, setStartDateFilter] = useState<string | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<string | null>(null);
  const [filterServiceId, setFilterServiceId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [filterProfessionalId, setFilterProfessionalId] = useState<string | null>(null);
  const [showAppointmentsFilterModal, setShowAppointmentsFilterModal] = useState(false);
  const [professionalsList, setProfessionalsList] = useState<ServiceOption[]>([]);
  const [professionalsError, setProfessionalsError] = useState<string | null>(null);
  const [pendingStartDate, setPendingStartDate] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const [pendingServiceId, setPendingServiceId] = useState("");
  const [pendingProfessionalId, setPendingProfessionalId] = useState("");
  const [pendingCategoryId, setPendingCategoryId] = useState("");
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [createAppointmentError, setCreateAppointmentError] = useState<string | null>(null);
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] =
    useState<AppointmentStatus>("agendado");
  const [selectedClient, setSelectedClient] = useState<UserItem | null>(null);
  const [appointmentProfessionals, setAppointmentProfessionals] = useState<
    AppointmentProfessionalSlot[]
  >([createProfessionalSlot()]);
  const [serviceAssignments, setServiceAssignments] = useState<
    Record<number, ServiceAssignment>
  >({});
  const [selectedAppointmentServices, setSelectedAppointmentServices] = useState<
    ServiceSimpleOption[]
  >([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false);
  const [discountInput, setDiscountInput] = useState("0");
  const [appointmentObservations, setAppointmentObservations] = useState("");
  const [appointmentsRefreshToken, setAppointmentsRefreshToken] = useState(0);
  const [showClientPickerModal, setShowClientPickerModal] = useState(false);
  const [clientSearchInput, setClientSearchInput] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientPickerResults, setClientPickerResults] = useState<UserItem[]>([]);
  const [clientPickerLoading, setClientPickerLoading] = useState(false);
  const [clientPickerError, setClientPickerError] = useState<string | null>(null);
  const [showClientRegistrationModal, setShowClientRegistrationModal] = useState(false);
  const [clientRegistrationForm, setClientRegistrationForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cpf: "",
    phone: "",
    dateOfBirth: "",
  });
  const [clientRegistrationSubmitting, setClientRegistrationSubmitting] = useState(false);
  const [clientRegistrationError, setClientRegistrationError] = useState<string | null>(null);
  const [showServicesPickerModal, setShowServicesPickerModal] = useState(false);
  const [servicesPickerSearchInput, setServicesPickerSearchInput] = useState("");
  const [servicesPickerSearchTerm, setServicesPickerSearchTerm] = useState("");
  const [servicesPickerResults, setServicesPickerResults] = useState<ServiceSimpleOption[]>([]);
  const [servicesPickerLoading, setServicesPickerLoading] = useState(false);
  const [servicesPickerError, setServicesPickerError] = useState<string | null>(null);
  const [servicesPickerTempSelection, setServicesPickerTempSelection] = useState<
    ServiceSimpleOption[]
  >([]);
  const [showProfessionalPickerModal, setShowProfessionalPickerModal] = useState(false);
  const [professionalPickerContext, setProfessionalPickerContext] = useState<{
    slotId: string;
  } | null>(null);
  const [professionalSearchInput, setProfessionalSearchInput] = useState("");
  const [professionalSearchTerm, setProfessionalSearchTerm] = useState("");
  const [professionalPickerResults, setProfessionalPickerResults] = useState<ServiceOption[]>([]);
  const [professionalPickerLoading, setProfessionalPickerLoading] = useState(false);
  const [professionalPickerError, setProfessionalPickerError] = useState<string | null>(null);
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [appointmentDateInput, setAppointmentDateInput] = useState(formatDateParam(new Date()));
  const [appointmentTimeInput, setAppointmentTimeInput] = useState("09:00");
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleProductsList, setSaleProductsList] = useState<ProductItem[]>([]);
  const [saleProductsLoading, setSaleProductsLoading] = useState(false);
  const [saleProductsError, setSaleProductsError] = useState<string | null>(null);
  const [selectedSaleProductId, setSelectedSaleProductId] = useState<number | null>(null);
  const [saleQuantityInput, setSaleQuantityInput] = useState("1");
  const [salePriceInput, setSalePriceInput] = useState("");
  const [salePaymentSelect, setSalePaymentSelect] = useState<PaymentType | "">("");
  const [isAddingSaleProduct, setIsAddingSaleProduct] = useState(false);
  const [addedSales, setAddedSales] = useState<AddedSaleItem[]>([]);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [productsInventory, setProductsInventory] = useState<ProductItem[]>([]);
  const [productsInventoryCount, setProductsInventoryCount] = useState(0);
  const [productsInventoryLoading, setProductsInventoryLoading] = useState(false);
  const [productsInventoryError, setProductsInventoryError] = useState<string | null>(null);
  const [productsSearchInput, setProductsSearchInput] = useState("");
  const [productsSearchTerm, setProductsSearchTerm] = useState("");
  const [productUseFilter, setProductUseFilter] = useState<string | null>(null);
  const [productTypeFilter, setProductTypeFilter] = useState<string | null>(null);
  const [productsRefreshToken, setProductsRefreshToken] = useState(0);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCreatingProductSale, setIsCreatingProductSale] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productSaleError, setProductSaleError] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSaleSubmitting, setProductSaleSubmitting] = useState(false);
  const [productSaleSelectedProduct, setProductSaleSelectedProduct] = useState<ProductItem | null>(null);
  const [productSalePriceInput, setProductSalePriceInput] = useState("");
  const [productSaleQuantityInput, setProductSaleQuantityInput] = useState("1");
  const [productSalePayment, setProductSalePayment] = useState<ProductSalePaymentType | null>(null);
  const [productSaleDateIso, setProductSaleDateIso] = useState(() => formatDateParam(new Date()));
  const [productSaleDateDisplay, setProductSaleDateDisplay] = useState(() =>
    formatIsoToDisplay(formatDateParam(new Date())),
  );
  const [productSaleUserIdInput, setProductSaleUserIdInput] = useState("");
  const [productSaleProductModalOpen, setProductSaleProductModalOpen] = useState(false);
  const [productSaleProducts, setProductSaleProducts] = useState<ProductItem[]>([]);
  const [productSaleProductsLoading, setProductSaleProductsLoading] = useState(false);
  const [productSaleProductsError, setProductSaleProductsError] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummaryResponse | null>(null);
  const [dailySummaryLoading, setDailySummaryLoading] = useState(false);
  const [dailySummaryError, setDailySummaryError] = useState<string | null>(null);
  const [pendingQuickAction, setPendingQuickAction] = useState<QuickActionKey | null>(null);
  const [showSummaryFilters, setShowSummaryFilters] = useState(false);
  const [summaryFilterMode, setSummaryFilterMode] = useState<"day" | "month">("day");
  const [summaryDayInput, setSummaryDayInput] = useState("");
  const [summaryMonthYear, setSummaryMonthYear] = useState("");
  const [summaryMonthValue, setSummaryMonthValue] = useState("");
  const [activeSummaryDay, setActiveSummaryDay] = useState<string | null>(null);
  const [activeSummaryMonth, setActiveSummaryMonth] = useState<string | null>(null);
  const [summaryFilterError, setSummaryFilterError] = useState<string | null>(null);
  const [financeMonth, setFinanceMonth] = useState(formatMonthParam(new Date()));
  const [showFinanceMonthModal, setShowFinanceMonthModal] = useState(false);
  const [financeMonthYearInput, setFinanceMonthYearInput] = useState(new Date().getFullYear().toString());
  const [financeMonthValueInput, setFinanceMonthValueInput] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0"),
  );
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [financeSummaryLoading, setFinanceSummaryLoading] = useState(false);
  const [financeSummaryError, setFinanceSummaryError] = useState<string | null>(null);
  const [repassesList, setRepassesList] = useState<RepasseItem[]>([]);
  const [repassesLoading, setRepassesLoading] = useState(false);
  const [repassesError, setRepassesError] = useState<string | null>(null);
  const [billsList, setBillsList] = useState<BillItem[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsError, setBillsError] = useState<string | null>(null);
  const [showAllBills, setShowAllBills] = useState(false);
  const [financeMonthError, setFinanceMonthError] = useState<string | null>(null);

  const {
    register: registerCreateUser,
    handleSubmit: handleSubmitCreateUser,
    watch: watchCreateUser,
    setValue: setCreateUserValue,
    reset: resetCreateUserForm,
    formState: { errors: createUserErrors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: createUserDefaultValues,
  });

  const {
    register: registerEditUser,
    handleSubmit: handleSubmitEditUser,
    reset: resetEditUserForm,
    setValue: setEditUserValue,
    watch: watchEditUser,
    formState: { errors: editUserErrors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: editUserDefaultValues,
  });

  const resetAppointmentForm = useCallback(() => {
    setAppointmentDateInput(formatDateParam(selectedDate));
    setAppointmentTimeInput("09:00");
    setSelectedAppointmentStatus("agendado");
    setSelectedClient(null);
    setAppointmentProfessionals([createProfessionalSlot()]);
    setServiceAssignments({});
    setSelectedAppointmentServices([]);
    setSelectedPaymentType(null);
    setPriceInput("");
    setPriceManuallyEdited(false);
    setDiscountInput("0");
    setAppointmentObservations("");
    setCreateAppointmentError(null);
    setAddedSales([]);
    setSaleModalOpen(false);
    setSelectedSaleProductId(null);
    setSaleQuantityInput("1");
    setSalePriceInput("");
    setSalePaymentSelect("");
    setProfessionalPickerContext(null);
    setShowProfessionalPickerModal(false);
    setServicesPickerTempSelection([]);
    setEditingAppointmentId(null);
  }, [selectedDate]);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    watch: watchProfile,
    reset: resetProfileForm,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfessionalProfileFormValues>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: professionalProfileDefaultValues,
  });

  const {
    register: registerCreateService,
    handleSubmit: handleSubmitCreateService,
    reset: resetCreateServiceForm,
    setValue: setCreateServiceValue,
    watch: watchCreateService,
    formState: { errors: createServiceErrors },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: createServiceDefaultValues,
  });
const productUsageWatch = watchCreateService("productUsage") ?? [];
  const {
    register: registerEditService,
    handleSubmit: handleSubmitEditService,
    reset: resetEditServiceForm,
    formState: { errors: editServiceErrors },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: createServiceDefaultValues,
  });

  const {
    register: registerCreateProduct,
    handleSubmit: handleSubmitCreateProduct,
    reset: resetCreateProductForm,
    setValue: setCreateProductValue,
    watch: watchCreateProduct,
    formState: { errors: createProductErrors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: createProductDefaultValues,
  });

  const passwordValue = watchCreateUser("password") ?? "";
  const confirmPasswordValue = watchCreateUser("confirmPassword") ?? "";
  const dateOfBirthValue = watchCreateUser("dateOfBirth") ?? "";
  const passwordChecks = passwordRequirementCheck(passwordValue);
  const totalPasswordRequirements = Object.keys(passwordRequirementLabels).length;
  const passwordStrengthScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrengthPercent =
    (passwordStrengthScore / totalPasswordRequirements) * 100;
  const passwordStrengthColor =
    passwordStrengthScore <= 2
      ? "bg-red-500"
      : passwordStrengthScore === 3
        ? "bg-amber-400"
        : passwordStrengthScore === 4
          ? "bg-emerald-400"
          : "bg-emerald-500";
  const passwordsMatch =
    confirmPasswordValue.length === 0 || passwordValue === confirmPasswordValue;
  const selectedProfessionalServices = watchProfile("services") ?? [];
  const editDateOfBirthValue = watchEditUser("dateOfBirth") ?? "";
  const selectedServiceNames = servicesOptions
    .filter((service) => selectedProfessionalServices.includes(service.id))
    .map((service) => service.name);
  const createProductPricePaidValue = watchCreateProduct("pricePaid") ?? "";
  const createProductPriceToSellValue = watchCreateProduct("priceToSell") ?? "";

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut({ redirect: false });
    router.replace("/dashboard/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        event.target instanceof Node &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setShowRoleDropdown(false);
      }
    };

    if (showRoleDropdown) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showRoleDropdown]);

  useEffect(() => {
    if (!showServicesDropdown) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesDropdownRef.current &&
        event.target instanceof Node &&
        !servicesDropdownRef.current.contains(event.target)
      ) {
        setShowServicesDropdown(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showServicesDropdown]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const controller = new AbortController();

    const fetchRoleOptions = async () => {
      try {
        const response = await fetch(roleChoicesEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os tipos de usuário.");
        }

        const data: RoleOption[] = await response.json();
        setRoleOptions(data);
        setRoleOptionsError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setRoleOptionsError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar tipos de usuário.",
          );
        }
      }
    };

    fetchRoleOptions();
    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const controller = new AbortController();

    const fetchServiceCategories = async () => {
      try {
        const response = await fetch(serviceCategoriesEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as categorias.");
        }

        const data: ServiceCategoryOption[] = await response.json();
        setServiceCategories(data);
        setServiceCategoriesError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServiceCategoriesError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar categorias.",
          );
        }
      }
    };

    fetchServiceCategories();
    return () => controller.abort();
  }, [accessToken]);

  const buildUsersUrl = useCallback(() => {
    const url = new URL(usersEndpointBase);
    url.searchParams.set("page_size", pageSize.toString());
    if (searchTerm) {
      url.searchParams.set("search", searchTerm);
    }
    if (roleFilter) {
      url.searchParams.set("role", roleFilter);
    }
    return url.toString();
  }, [pageSize, searchTerm, roleFilter]);

  useEffect(() => {
    setUsersEndpoint(buildUsersUrl());
  }, [buildUsersUrl]);

  useEffect(() => {
    if (activeTab !== "services" || !accessToken) {
      return;
    }

    const controller = new AbortController();
    const fetchServices = async () => {
      setServicesLoadingList(true);
      setServicesFetchError(null);
      try {
        const url = new URL(servicesEndpointBase);
        if (servicesSearchTerm) {
          url.searchParams.set("search", servicesSearchTerm);
        }
        if (selectedServiceCategory) {
          url.searchParams.set("category_id", String(selectedServiceCategory));
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os serviços.");
        }

        const data: ServicesResponse = await response.json();
        setServicesList(data.results);
        setServicesCount(data.count);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServicesList([]);
          setServicesCount(0);
          setServicesFetchError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar serviços.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setServicesLoadingList(false);
        }
      }
    };

    fetchServices();
    return () => controller.abort();
  }, [activeTab, accessToken, servicesSearchTerm, selectedServiceCategory, servicesRefreshToken]);

  useEffect(() => {
    if (activeTab !== "users" || !accessToken) {
      return;
    }

    const controller = new AbortController();
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const response = await fetch(usersEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os usuários.");
        }

        const data: UsersResponse = await response.json();
        setUsersData(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setUsersError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar usuários.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsersLoading(false);
        }
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [activeTab, usersEndpoint, accessToken]);

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const timeout = setTimeout(() => setFeedbackMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [feedbackMessage]);

  useEffect(() => {
    registerProfile("services");
  }, [registerProfile]);

  useEffect(() => {
    if (activeTab !== "users") {
      setIsCreatingUser(false);
      setSelectedUserId(null);
      setShowProfileForm(false);
      setFormError(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "services") {
      setIsCreatingService(false);
      setProductsModalOpen(false);
      setSelectedServiceId(null);
      setServiceDetail(null);
      setServiceDetailError(null);
      setCanEditService(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "products") {
      setIsCreatingProduct(false);
      setIsCreatingProductSale(false);
      setProductFormError(null);
      setProductSaleError(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "agenda") {
      setIsCreatingAppointment(false);
      resetAppointmentForm();
    }
  }, [activeTab, resetAppointmentForm]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const controller = new AbortController();

    const fetchProfessionals = async () => {
      try {
        const response = await fetch(professionalProfilesSimpleListEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar profissionais.");
        }

        const data = (await response.json()) as ProfessionalSimple[];
        const list: ServiceOption[] = Array.isArray(data)
          ? data.map((item) => ({ id: item.id, name: item.user_name }))
          : [];
        setProfessionalsList(list);
        setProfessionalsError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setProfessionalsError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar profissionais.",
          );
        }
      }
    };

    fetchProfessionals();
    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    if (selectedAppointmentServices.length === 0) {
      setPriceInput("");
      setPriceManuallyEdited(false);
      return;
    }
    if (priceManuallyEdited) {
      return;
    }
    const total = selectedAppointmentServices.reduce((sum, service) => {
      const value = Number(service.price ?? 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
    setPriceInput(total.toFixed(2));
  }, [selectedAppointmentServices, priceManuallyEdited]);

  useEffect(() => {
    if (!showClientPickerModal || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchClients = async () => {
      setClientPickerLoading(true);
      setClientPickerError(null);
      try {
        const url = new URL(usersEndpointBase);
        url.searchParams.set("page_size", "10");
        if (clientSearchTerm) {
          url.searchParams.set("search", clientSearchTerm);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar clientes.");
        }

        const data: UsersResponse = await response.json();
        setClientPickerResults(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setClientPickerError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao buscar clientes.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setClientPickerLoading(false);
        }
      }
    };

    fetchClients();
    return () => controller.abort();
  }, [showClientPickerModal, clientSearchTerm, accessToken]);

  useEffect(() => {
    if (!showServicesPickerModal || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchServices = async () => {
      setServicesPickerLoading(true);
      setServicesPickerError(null);
      try {
        const url = new URL(servicesSimpleListEndpoint);
        if (servicesPickerSearchTerm) {
          url.searchParams.set("search", servicesPickerSearchTerm);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar serviços.");
        }

        const data: ServiceSimpleOption[] = await response.json();
        setServicesPickerResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServicesPickerError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao buscar serviços.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setServicesPickerLoading(false);
        }
      }
    };

    fetchServices();
    return () => controller.abort();
  }, [showServicesPickerModal, servicesPickerSearchTerm, accessToken]);

  useEffect(() => {
    if (!showProfessionalPickerModal || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchProfessionalsForPicker = async () => {
      setProfessionalPickerLoading(true);
      setProfessionalPickerError(null);
      try {
        const url = new URL(professionalProfilesSimpleListEndpoint);
        if (professionalSearchTerm) {
          url.searchParams.set("search", professionalSearchTerm);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar profissionais.");
        }

        const data: ProfessionalSimple[] = await response.json();
        const mapped = Array.isArray(data)
          ? data.map((item) => ({ id: item.id, name: item.user_name }))
          : [];
        setProfessionalPickerResults(mapped);
      } catch (err) {
        if (!controller.signal.aborted) {
          setProfessionalPickerError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao buscar profissionais.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setProfessionalPickerLoading(false);
        }
      }
    };

    fetchProfessionalsForPicker();
    return () => controller.abort();
  }, [showProfessionalPickerModal, professionalSearchTerm, accessToken]);

  useEffect(() => {
    if (!saleModalOpen || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchSaleProducts = async () => {
      setSaleProductsLoading(true);
      setSaleProductsError(null);
      try {
        const url = new URL(productsEndpointBase);
        url.searchParams.set("use_type", "venda");
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar produtos para venda.");
        }
        const data: ProductsResponse = await response.json();
        setSaleProductsList(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setSaleProductsError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar produtos para venda.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSaleProductsLoading(false);
        }
      }
    };

    fetchSaleProducts();
    return () => controller.abort();
  }, [saleModalOpen, accessToken]);

  useEffect(() => {
    if (!productSaleProductModalOpen || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchSalePickerProducts = async () => {
      setProductSaleProductsLoading(true);
      setProductSaleProductsError(null);
      try {
        const url = new URL(productsEndpointBase);
        url.searchParams.set("use_type", "venda");
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar os produtos de venda.");
        }
        const data: ProductsResponse = await response.json();
        setProductSaleProducts(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setProductSaleProductsError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar os produtos de venda.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setProductSaleProductsLoading(false);
        }
      }
    };

    fetchSalePickerProducts();
    return () => controller.abort();
  }, [productSaleProductModalOpen, accessToken]);

  useEffect(() => {
    if (activeTab !== "home" || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchDailySummary = async () => {
      setDailySummaryLoading(true);
      setDailySummaryError(null);
      try {
        const url = new URL(`${env.apiBaseUrl}/dashboard/summary/daily/`);
        if (activeSummaryDay) {
          url.searchParams.set("day", activeSummaryDay);
        }
        if (activeSummaryMonth) {
          url.searchParams.set("month", activeSummaryMonth);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar o resumo diário.");
        }
        const data: DailySummaryResponse = await response.json();
        setDailySummary(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setDailySummaryError(
            err instanceof Error ? err.message : "Erro inesperado ao carregar o resumo.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDailySummaryLoading(false);
        }
      }
    };

    fetchDailySummary();
    return () => controller.abort();
  }, [activeTab, accessToken, activeSummaryDay, activeSummaryMonth]);

  useEffect(() => {
    if (activeTab !== "products" || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchProductsInventory = async () => {
      setProductsInventoryLoading(true);
      setProductsInventoryError(null);
      try {
        const url = new URL(productsEndpointBase);
        if (productsSearchTerm) {
          url.searchParams.set("search", productsSearchTerm);
        }
        if (productUseFilter) {
          url.searchParams.set("use_type", productUseFilter);
        }
        if (productTypeFilter) {
          url.searchParams.set("type", productTypeFilter);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar os produtos.");
        }
        const data: ProductsResponse = await response.json();
        const list = Array.isArray(data.results) ? data.results : [];
        setProductsInventoryCount(
          typeof data.count === "number" ? data.count : list.length,
        );
        setProductsInventory(list);
      } catch (err) {
        if (!controller.signal.aborted) {
          setProductsInventoryError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar os produtos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setProductsInventoryLoading(false);
        }
      }
    };

    fetchProductsInventory();
    return () => controller.abort();
  }, [
    activeTab,
    accessToken,
    productsSearchTerm,
    productUseFilter,
    productTypeFilter,
    productsRefreshToken,
  ]);

  useEffect(() => {
    if (!showClientPickerModal) {
      setClientSearchInput("");
      setClientSearchTerm("");
      setClientPickerResults([]);
      setClientPickerError(null);
      setClientPickerLoading(false);
    }
  }, [showClientPickerModal]);

  useEffect(() => {
    if (!showServicesPickerModal) {
      setServicesPickerSearchInput("");
      setServicesPickerSearchTerm("");
      setServicesPickerResults([]);
      setServicesPickerError(null);
      setServicesPickerLoading(false);
    }
  }, [showServicesPickerModal]);

  useEffect(() => {
    if (!showProfessionalPickerModal) {
      setProfessionalSearchInput("");
      setProfessionalSearchTerm("");
      setProfessionalPickerResults([]);
      setProfessionalPickerError(null);
      setProfessionalPickerLoading(false);
    }
  }, [showProfessionalPickerModal]);

  useEffect(() => {
    if (!saleModalOpen) {
      setSelectedSaleProductId(null);
      setSaleQuantityInput("1");
      setSalePriceInput("");
      setSalePaymentSelect("");
    }
  }, [saleModalOpen]);

  useEffect(() => {
    if (!selectedUserId || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchUserDetail = async () => {
      setUserDetailLoading(true);
      setUserDetailError(null);
      try {
        const response = await fetch(`${usersEndpointBase}${selectedUserId}/`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os detalhes do usuário.");
        }

        const data: UserDetail = await response.json();
        setUserDetail(data);
        const editableValues: EditUserFormValues = {
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          email: data.email ?? "",
          cpf: data.cpf ?? "",
          phone: data.phone ?? "",
          role: data.role ?? "",
          dateOfBirth: data.date_of_birth ?? "",
          isActive: data.is_active ?? true,
          profilePic: undefined,
        };
        resetEditUserForm(editableValues);
        if (data.role === "professional") {
          if (data.professional_profile) {
            const normalizedServices = Array.isArray(
              data.professional_profile.services,
            )
              ? data.professional_profile.services
                  .map((service) =>
                    typeof service === "number" ? service : (service as { id: number })?.id ?? 0,
                  )
                  .filter((id) => id > 0)
              : [];
            resetProfileForm({
              professionalType: data.professional_profile.professional_type ?? "",
              cnpj: data.professional_profile.cnpj ?? "",
              commission: String(data.professional_profile.commission ?? ""),
              bio: data.professional_profile.bio ?? "",
              services: normalizedServices,
            });
            setShowProfileForm(true);
          } else {
            resetProfileForm(professionalProfileDefaultValues);
            setShowProfileForm(false);
          }
        } else {
          resetProfileForm(professionalProfileDefaultValues);
          setShowProfileForm(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setUserDetailError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar os detalhes.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setUserDetailLoading(false);
        }
      }
    };

    fetchUserDetail();
    return () => controller.abort();
  }, [
    selectedUserId,
    accessToken,
    resetEditUserForm,
    resetProfileForm,
  ]);

  useEffect(() => {
    if (!selectedUserId || !accessToken) {
      return;
    }
    if (userDetail?.role !== "professional") {
      setServicesOptions([]);
      setServicesError(null);
      return;
    }
    const controller = new AbortController();
    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await fetch(servicesSimpleListEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os serviços.");
        }

        const data: ServiceOption[] = await response.json();
        setServicesOptions(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServicesError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar serviços.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setServicesLoading(false);
        }
      }
    };

    fetchServices();
    return () => controller.abort();
  }, [selectedUserId, accessToken, userDetail?.role]);

  useEffect(() => {
    if (!productsModalOpen || !accessToken) {
      return;
    }

    const controller = new AbortController();

    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const url = new URL(productsEndpointBase);
        url.searchParams.set("use_type", "interno");
        url.searchParams.set("type", "insumo");
        if (productSearchInput) {
          url.searchParams.set("search", productSearchInput);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os produtos.");
        }

        const data = await response.json();
        const list: ServiceOption[] = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];
        setProductsList(list);
      } catch (err) {
        if (!controller.signal.aborted) {
          setProductsError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar produtos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setProductsLoading(false);
        }
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [productsModalOpen, accessToken, productSearchInput]);

  useEffect(() => {
    if (!showClientHistory || !selectedUserId || !accessToken) {
      return;
    }

    const controller = new AbortController();
    const fetchHistory = async () => {
      setClientHistoryLoading(true);
      setClientHistoryError(null);
      try {
        const response = await fetch(
          `${env.apiBaseUrl}/dashboard/appointments/summary/${selectedUserId}/`,
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Não foi possível carregar o histórico do cliente.");
        }

        const data: ClientHistorySummary = await response.json();
        setClientHistoryData(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setClientHistoryError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar o histórico.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setClientHistoryLoading(false);
        }
      }
    };

    fetchHistory();
    return () => controller.abort();
  }, [showClientHistory, selectedUserId, accessToken]);

  useEffect(() => {
    if (!selectedServiceId || !accessToken) {
      return;
    }
    const controller = new AbortController();

    const fetchServiceDetail = async () => {
      setServiceDetailLoading(true);
      setServiceDetailError(null);
      try {
        const response = await fetch(`${servicesEndpointBase}${selectedServiceId}/`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar o serviço.");
        }

        const data = (await response.json()) as ServiceItem & {
          product_usages?: ProductUsage[];
        };
        const normalized = {
          ...data,
          product_usages: data.product_usages ?? [],
        };
        setServiceDetail(normalized);
        resetEditServiceForm({
          name: normalized.name,
          price: normalized.price,
          category: String(normalized.category),
          duration: normalized.duration,
          isActive: normalized.is_active,
          productUsage: [],
        });
        setCanEditService(false);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServiceDetailError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar o serviço.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setServiceDetailLoading(false);
        }
      }
    };

    fetchServiceDetail();
    return () => controller.abort();
  }, [selectedServiceId, accessToken, resetEditServiceForm]);

  useEffect(() => {
    if (activeTab !== "agenda" || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      try {
        const url = new URL(appointmentsEndpointBase);
        if (startDateFilter && endDateFilter) {
          url.searchParams.set("start_date", startDateFilter);
          url.searchParams.set("end_date", endDateFilter);
        } else {
          url.searchParams.set("date", formatDateParam(selectedDate));
        }
        if (filterProfessionalId) {
          url.searchParams.set("professional_profile_id", filterProfessionalId);
        }
        if (filterServiceId) {
          url.searchParams.set("service_id", filterServiceId);
        }
        if (filterCategoryId) {
          url.searchParams.set("service_category_id", filterCategoryId);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os agendamentos.");
        }

        const data: AppointmentsResponse = await response.json();
        setAppointments(data.results);
        setAppointmentsCount(data.count);
        setAppointmentsSummary({
          completed_total_price: data.completed_total_price ?? "0",
          completed_total_count: data.completed_total_count ?? 0,
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          setAppointmentsError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar agendamentos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAppointmentsLoading(false);
        }
      }
    };

    fetchAppointments();
    return () => controller.abort();
  }, [
    activeTab,
    accessToken,
    selectedDate,
    startDateFilter,
    endDateFilter,
    filterProfessionalId,
    filterServiceId,
    filterCategoryId,
    appointmentsRefreshToken,
  ]);

  useEffect(() => {
    if (!selectedAppointmentId || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchAppointmentDetail = async () => {
      setAppointmentDetailLoading(true);
      setAppointmentDetailError(null);
      try {
        const response = await fetch(`${appointmentsEndpointBase}${selectedAppointmentId}/`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar o agendamento.");
        }

        const data: AppointmentItem = await response.json();
        setAppointmentDetail(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setAppointmentDetailError(
            err instanceof Error ? err.message : "Erro inesperado ao carregar o agendamento.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAppointmentDetailLoading(false);
        }
      }
    };

    fetchAppointmentDetail();
    return () => controller.abort();
  }, [selectedAppointmentId, appointmentDetailRefreshToken, accessToken]);

  const roleLabelMap = useMemo(() => {
    return roleOptions.reduce<Record<string, string>>((acc, option) => {
      acc[option.value] = option.label;
      return acc;
    }, {});
  }, [roleOptions]);

  const appointmentServicesSubtotal = useMemo(() => {
    return selectedAppointmentServices.reduce((sum, service) => {
      const value = Number(service.price ?? 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [selectedAppointmentServices]);

  const filledAppointmentProfessionals = useMemo(() => {
    return appointmentProfessionals.filter((slot) => slot.professional !== null);
  }, [appointmentProfessionals]);

  const hasMultipleProfessionals = filledAppointmentProfessionals.length > 1;

  const normalizedDiscount = useMemo(() => {
    const parsed = Number(discountInput);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    if (parsed < 0) {
      return 0;
    }
    if (parsed > 100) {
      return 100;
    }
    return parsed;
  }, [discountInput]);

  const appointmentPriceValue = useMemo(() => {
    return parseCurrencyInput(priceInput);
  }, [priceInput]);

  const servicesGrossTotal = useMemo(() => {
    if (selectedAppointmentServices.length === 0) {
      return 0;
    }
    if (hasMultipleProfessionals) {
      return selectedAppointmentServices.reduce((sum, service) => {
        const assignment = serviceAssignments[service.id];
        const rawPrice = assignment?.price ?? service.price ?? "0";
        const value = parseCurrencyInput(rawPrice);
        return sum + (Number.isNaN(value) ? 0 : value);
      }, 0);
    }
    return appointmentPriceValue;
  }, [
    selectedAppointmentServices,
    serviceAssignments,
    hasMultipleProfessionals,
    appointmentPriceValue,
  ]);

  const servicesDiscountAmount = useMemo(() => {
    return (servicesGrossTotal * normalizedDiscount) / 100;
  }, [servicesGrossTotal, normalizedDiscount]);

  const servicesTotalAfterDiscount = useMemo(() => {
    return Math.max(servicesGrossTotal - servicesDiscountAmount, 0);
  }, [servicesGrossTotal, servicesDiscountAmount]);

  const addedSalesTotal = useMemo(() => {
    return addedSales.reduce((sum, sale) => {
      const value = parseCurrencyInput(sale.price);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [addedSales]);

  const appointmentGrandTotal = useMemo(() => {
    return servicesTotalAfterDiscount + addedSalesTotal;
  }, [servicesTotalAfterDiscount, addedSalesTotal]);

  const currentProfessionalPickerSlot = useMemo(() => {
    if (!professionalPickerContext) {
      return null;
    }
    return (
      appointmentProfessionals.find((slot) => slot.id === professionalPickerContext.slotId) ??
      null
    );
  }, [professionalPickerContext, appointmentProfessionals]);

  const summaryFilterYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(currentYear + 1 - index));
  }, []);

  const totalUsers = usersData?.count ?? 0;
  const usersList = usersData?.results ?? [];
  const selectedRoleLabel = roleFilter
    ? roleLabelMap[roleFilter] ?? roleFilter
    : "Todos";
  const currentPage = useMemo(() => {
    try {
      const url = new URL(usersEndpoint);
      const param = url.searchParams.get("page");
      if (!param) {
        return 1;
      }
      const parsed = Number(param);
      return Number.isNaN(parsed) ? 1 : parsed;
    } catch {
      return 1;
    }
  }, [usersEndpoint]);
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const datePickerValue = convertDisplayDateToIso(dateOfBirthValue) ?? "";
  const appointmentsDateOptions = useMemo(() => {
    const options = [] as { date: Date; label: string; key: string }[];
    for (let offset = -2; offset <= 2; offset += 1) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + offset);
      options.push({
        date,
        label: formatDatePillLabel(date, new Date()),
        key: formatDateParam(date),
      });
    }
    return options;
  }, [selectedDate]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
  };

  const handleRoleSelect = (role: string | null) => {
    setRoleFilter(role);
    setShowRoleDropdown(false);
  };

  const handleOpenUserDetail = (userId: number) => {
    setIsCreatingUser(false);
    setSelectedUserId(userId);
    setFormError(null);
    setShowServicesDropdown(false);
    setShowClientHistory(false);
    setClientHistoryData(null);
    setClientHistoryError(null);
    setCanEditUser(false);
  };

  const handleBackToUserList = () => {
    setSelectedUserId(null);
    setUserDetail(null);
    setShowProfileForm(false);
    setFormError(null);
    setServicesOptions([]);
    setServicesError(null);
    setServicesLoading(false);
    setShowServicesDropdown(false);
    setShowClientHistory(false);
    setClientHistoryData(null);
    setClientHistoryError(null);
    setCanEditUser(false);
  };

  const handlePagination = (direction: "next" | "previous") => {
    if (!usersData) {
      return;
    }
    const target = direction === "next" ? usersData.next : usersData.previous;
    if (target) {
      setUsersEndpoint(target);
    }
  };

  const handleDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDisplayDate(event.target.value);
    setCreateUserValue("dateOfBirth", formatted, { shouldValidate: true });
  };

  const handleDatePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isoValue = event.target.value;
    if (!isoValue) {
      setCreateUserValue("dateOfBirth", "", { shouldValidate: true });
      return;
    }
    const [year, month, day] = isoValue.split("-");
    setCreateUserValue("dateOfBirth", `${day}/${month}/${year}`, {
      shouldValidate: true,
    });
  };

  const handleOpenDatePicker = () => {
    const input = datePickerRef.current;
    if (!input) {
      return;
    }
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  };

  const handleEditDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDisplayDate(event.target.value);
    setEditUserValue("dateOfBirth", formatted, { shouldValidate: true });
  };

  const handleOpenEditDatePicker = () => {
    const input = editDatePickerRef.current;
    if (!input) {
      return;
    }
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  };

  const handleEditDatePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isoValue = event.target.value;
    if (!isoValue) {
      setEditUserValue("dateOfBirth", "", { shouldValidate: true });
      return;
    }
    const [year, month, day] = isoValue.split("-");
    setEditUserValue("dateOfBirth", `${day}/${month}/${year}`, {
      shouldValidate: true,
    });
  };

  const handleStartCreateUser = () => {
    resetCreateUserForm(createUserDefaultValues);
    setFormError(null);
    setIsCreatingUser(true);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSelectedUserId(null);
    setUserDetail(null);
    setShowProfileForm(false);
  };

  const handleCancelCreateUser = () => {
    setIsCreatingUser(false);
    setFormError(null);
    resetCreateUserForm(createUserDefaultValues);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const refreshUsersList = () => {
    setUsersEndpoint(buildUsersUrl());
  };

  const handleToggleProfessionalService = (serviceId: number) => {
    const current = selectedProfessionalServices;
    const isSelected = current.includes(serviceId);
    const updated = isSelected
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];
    setProfileValue("services", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleServiceSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServicesSearchTerm(servicesSearchInput.trim());
  };

  const handleServiceCategorySelect = (categoryId: number | null) => {
    setSelectedServiceCategory(categoryId);
  };

  const refreshServicesList = () => {
    setServicesRefreshToken((prev) => prev + 1);
  };

  const handleStartCreateService = () => {
    setIsCreatingService(true);
    resetCreateServiceForm(createServiceDefaultValues);
  };

  const handleCancelCreateService = () => {
    setIsCreatingService(false);
    resetCreateServiceForm(createServiceDefaultValues);
    setProductsModalOpen(false);
    setSelectedProductCandidate(null);
    setProductQuantityInput("1");
    setProductSearchInput("");
    setProductModalContext(null);
  };

  const handleOpenServiceDetail = (serviceId: number) => {
    setIsCreatingService(false);
    setSelectedServiceId(serviceId);
    setServiceDetail(null);
    setServiceDetailError(null);
    setCanEditService(false);
    setProductModalContext(null);
  };

  const handleBackToServiceList = () => {
    setSelectedServiceId(null);
    setServiceDetail(null);
    setServiceDetailError(null);
    setCanEditService(false);
    setProductsModalOpen(false);
    setProductModalContext(null);
  };

  const handleOpenProductModal = (context: "create" | "service-detail") => {
    setProductModalContext(context);
    setSelectedProductCandidate(null);
    setProductQuantityInput("1");
    setProductSearchInput("");
    setProductsModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductsModalOpen(false);
    setProductModalContext(null);
    setSelectedProductCandidate(null);
    setProductQuantityInput("1");
    setProductSearchInput("");
    setProductsError(null);
  };

  const handleToggleServiceEdit = () => {
    if (!serviceDetail) {
      return;
    }
    setCanEditService((previous) => {
      const next = !previous;
      if (!next) {
        resetEditServiceForm({
          name: serviceDetail.name,
          price: serviceDetail.price,
          category: String(serviceDetail.category),
          duration: serviceDetail.duration,
          isActive: serviceDetail.is_active,
          productUsage: [],
        });
      }
      return next;
    });
  };

  const handleCreateUser = handleSubmitCreateUser(async (values) => {
    setFormError(null);

    if (!accessToken) {
      setFormError("Sessão expirada. Faça login novamente.");
      return;
    }

    const isoDate = convertDisplayDateToIso(values.dateOfBirth);
    if (!isoDate) {
      setFormError("Informe uma data de nascimento válida (dd/mm/aaaa).");
      return;
    }

    const payload = {
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password,
      cpf: values.cpf?.trim() || null,
      phone: values.phone?.trim() || "",
      role: values.role,
      date_of_birth: isoDate,
    };

    setIsSavingUser(true);
    try {
      const response = await fetch(usersEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail =
          (data && (data.detail || data.message)) ||
          "Não foi possível criar o usuário.";
        throw new Error(detail);
      }

      setFeedbackMessage({
        type: "success",
        message: "Usuário criado com sucesso.",
      });
      handleCancelCreateUser();
      refreshUsersList();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao criar usuário.",
      );
    } finally {
      setIsSavingUser(false);
    }
  });

  const handleCreateService = handleSubmitCreateService(async (values) => {
    setFormError(null);
    if (!accessToken) {
      setFormError("Sessão expirada. Faça login novamente.");
      return;
    }

    const payload = {
      name: values.name.trim(),
      price: values.price,
      category: Number(values.category),
      duration: values.duration,
      is_active: values.isActive,
      product_usage: (values.productUsage || []).map((item) => ({
        product: item.product,
        quantity_used: item.quantity_used,
      })),
    };

    setIsSavingService(true);
    try {
      const response = await fetch(servicesEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail =
          (data && (data.detail || data.message)) ||
          "Não foi possível criar o serviço.";
        throw new Error(detail);
      }

      setFeedbackMessage({
        type: "success",
        message: "Serviço criado com sucesso.",
      });
      handleCancelCreateService();
      refreshServicesList();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao criar o serviço.",
      );
    } finally {
      setIsSavingService(false);
    }
  });

  const handleUpdateService = handleSubmitEditService(async (values) => {
    if (!accessToken || !serviceDetail) {
      setFormError("Sessão expirada. Faça login novamente.");
      return;
    }

    const payload = {
      name: values.name.trim(),
      price: values.price,
      category: Number(values.category),
      duration: values.duration,
      is_active: values.isActive,
    };

    setIsUpdatingService(true);
    try {
      const response = await fetch(`${servicesEndpointBase}${serviceDetail.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail =
          (data && (data.detail || data.message)) ||
          "Não foi possível atualizar o serviço.";
        throw new Error(detail);
      }

      setFeedbackMessage({
        type: "success",
        message: "Serviço atualizado com sucesso.",
      });
      setCanEditService(false);
      setServiceDetail((prev) =>
        prev
          ? {
              ...prev,
              name: values.name.trim(),
              price: values.price,
              category: Number(values.category),
              category_name:
                serviceCategories.find((cat) => String(cat.id) === values.category)?.name ||
                prev.category_name,
              duration: values.duration,
              is_active: values.isActive,
            }
          : prev,
      );
      refreshServicesList();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao atualizar o serviço.",
      );
    } finally {
      setIsUpdatingService(false);
    }
  });

  const handleDeleteProductUsage = async (usageId: number) => {
    if (!accessToken) {
      setFormError("Sessão expirada. Faça login novamente.");
      return;
    }
    setProductUsageDeletingId(usageId);
    try {
      const response = await fetch(`${productUsagesEndpointBase}${usageId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível remover o produto.");
      }

      setServiceDetail((prev) =>
        prev
          ? {
              ...prev,
              product_usages: prev.product_usages.filter((usage) => usage.id !== usageId),
            }
          : prev,
      );
      setFeedbackMessage({
        type: "success",
        message: "Produto removido.",
      });
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao remover o produto.",
      );
    } finally {
      setProductUsageDeletingId(null);
    }
  };

  const handleConfirmProductSelection = async () => {
    if (!selectedProductCandidate) {
      setProductsError("Selecione um produto.");
      return;
    }
    const quantity = Number(productQuantityInput);
    if (Number.isNaN(quantity) || quantity <= 0) {
      setProductsError("Informe uma quantidade válida.");
      return;
    }
    const pickedProduct = productsList.find((product) => product.id === selectedProductCandidate);

    if (productModalContext === "service-detail") {
      if (!serviceDetail || !accessToken) {
        setFormError("Sessão expirada. Faça login novamente.");
        return;
      }
      setIsAddingProductUsage(true);
      try {
        const response = await fetch(productUsagesEndpointBase, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            service: serviceDetail.id,
            product: selectedProductCandidate,
            quantity_used: quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Não foi possível adicionar o produto.");
        }

        const usageResponse: ProductUsage = await response.json();
        const usage: ProductUsage = {
          ...usageResponse,
          product_name:
            usageResponse.product_name || pickedProduct?.name || usageResponse.product_name,
        };
        setServiceDetail((prev) =>
          prev
            ? {
                ...prev,
                product_usages: [...prev.product_usages, usage],
              }
            : prev,
        );
        setFeedbackMessage({
          type: "success",
          message: "Produto adicionado.",
        });
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : "Erro inesperado ao adicionar o produto.",
        );
        return;
      } finally {
        setIsAddingProductUsage(false);
      }
    } else {
      const current = productUsageWatch;
      const updated = [
        ...current.map((item) => ({ ...item })),
        {
          product: selectedProductCandidate,
          quantity_used: quantity,
          product_name: pickedProduct?.name,
        },
      ];
      setCreateServiceValue("productUsage", updated, { shouldValidate: true, shouldDirty: true });
    }

    handleCloseProductModal();
  };

  const handleRemoveNewProductUsage = (index: number) => {
    const updated = productUsageWatch.filter((_, idx) => idx !== index);
    setCreateServiceValue("productUsage", updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setStartDateFilter(null);
    setEndDateFilter(null);
  };

  const handleOpenAppointmentsFilter = () => {
    setPendingStartDate(startDateFilter ?? "");
    setPendingEndDate(endDateFilter ?? "");
    setPendingServiceId(filterServiceId);
    setPendingProfessionalId(filterProfessionalId ?? "");
    setPendingCategoryId(filterCategoryId ?? "");
    setShowAppointmentsFilterModal(true);
  };

  const handleApplyAppointmentsFilter = () => {
    setStartDateFilter(pendingStartDate || null);
    setEndDateFilter(pendingEndDate || null);
    setFilterServiceId(pendingServiceId.trim());
    setFilterProfessionalId(pendingProfessionalId || null);
    setFilterCategoryId(pendingCategoryId || null);
    setShowAppointmentsFilterModal(false);
  };

  const handleClearAppointmentsFilter = () => {
    setPendingStartDate("");
    setPendingEndDate("");
    setPendingServiceId("");
    setPendingProfessionalId("");
    setPendingCategoryId("");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setFilterServiceId("");
    setFilterProfessionalId(null);
    setFilterCategoryId(null);
  };

  const handleStartCreateAppointment = useCallback(() => {
    resetAppointmentForm();
    setIsCreatingAppointment(true);
  }, [resetAppointmentForm]);

  const handleCancelCreateAppointment = () => {
    setIsCreatingAppointment(false);
    resetAppointmentForm();
  };

  const handleClientPickerSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientSearchTerm(clientSearchInput.trim());
  };

  const handleServicePickerSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServicesPickerSearchTerm(servicesPickerSearchInput.trim());
  };

  const handleProfessionalPickerSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfessionalSearchTerm(professionalSearchInput.trim());
  };

  const handleSelectClient = (client: UserItem) => {
    setSelectedClient(client);
    setShowClientPickerModal(false);
    setCreateAppointmentError(null);
  };

  const handleOpenClientRegistrationModal = () => {
    setClientRegistrationForm({
      firstName: "",
      lastName: "",
      email: "",
      cpf: "",
      phone: "",
      dateOfBirth: "",
    });
    setClientRegistrationError(null);
    setShowClientRegistrationModal(true);
  };

  const handleClientRegistrationInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setClientRegistrationForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmitClientRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setClientRegistrationError("Sessão expirada. Faça login novamente.");
      return;
    }
    setClientRegistrationError(null);
    const trimmedFirstName = clientRegistrationForm.firstName.trim();
    const trimmedLastName = clientRegistrationForm.lastName.trim();
    const trimmedEmail = clientRegistrationForm.email.trim();
    const trimmedCpf = clientRegistrationForm.cpf.trim();
    const trimmedPhone = clientRegistrationForm.phone.trim();
    const birthDate = clientRegistrationForm.dateOfBirth;

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
      !trimmedCpf ||
      !trimmedPhone ||
      !birthDate
    ) {
      setClientRegistrationError("Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      email: trimmedEmail,
      cpf: trimmedCpf,
      phone: trimmedPhone,
      date_of_birth: birthDate,
    };

    setClientRegistrationSubmitting(true);
    try {
      const response = await fetch(clientsEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível registrar o cliente.";
        try {
          const data = await response.json();
          if (data?.detail) {
            errorMessage = data.detail;
          }
        } catch {
          /* noop */
        }
        throw new Error(errorMessage);
      }

      const createdClient: UserItem = await response.json();
      setFeedbackMessage({
        type: "success",
        message: "Cliente registrado com sucesso.",
      });
      setSelectedClient(createdClient);
      setShowClientRegistrationModal(false);
      setClientRegistrationForm({
        firstName: "",
        lastName: "",
        email: "",
        cpf: "",
        phone: "",
        dateOfBirth: "",
      });
    } catch (err) {
      setClientRegistrationError(
        err instanceof Error ? err.message : "Erro inesperado ao registrar o cliente.",
      );
    } finally {
      setClientRegistrationSubmitting(false);
    }
  };

  const handleOpenFinanceMonthModal = () => {
    const [year, month] = financeMonth.split("-");
    setFinanceMonthYearInput(year || new Date().getFullYear().toString());
    setFinanceMonthValueInput(month || (new Date().getMonth() + 1).toString().padStart(2, "0"));
    setFinanceMonthError(null);
    setShowFinanceMonthModal(true);
  };

  const handleCloseFinanceMonthModal = () => {
    setShowFinanceMonthModal(false);
    setFinanceMonthError(null);
  };

  const handleApplyFinanceMonth = () => {
    if (!financeMonthYearInput || financeMonthYearInput.length !== 4) {
      setFinanceMonthError("Informe o ano no formato YYYY.");
      return;
    }
    if (!financeMonthValueInput) {
      setFinanceMonthError("Selecione o mês.");
      return;
    }
    const numericMonth = Number(financeMonthValueInput);
    if (Number.isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) {
      setFinanceMonthError("Selecione um mês válido.");
      return;
    }
    const formattedMonth = financeMonthValueInput.padStart(2, "0");
    setFinanceMonth(`${financeMonthYearInput}-${formattedMonth}`);
    setShowFinanceMonthModal(false);
    setFinanceMonthError(null);
    setShowAllBills(false);
  };

  const handleOpenAppointmentDetail = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setAppointmentDetail(null);
    setAppointmentDetailError(null);
  };

  const handleCloseAppointmentDetail = () => {
    setSelectedAppointmentId(null);
    setAppointmentDetail(null);
    setAppointmentDetailError(null);
  };

  const refreshAppointmentDetail = () => {
    setAppointmentDetailRefreshToken((previous) => previous + 1);
  };

  const handleUpdateAppointmentStatus = async (status: AppointmentStatus) => {
    if (!selectedAppointmentId || !accessToken) {
      return;
    }
    if (appointmentDetail?.status === status) {
      return;
    }
    setAppointmentDetailError(null);
    setAppointmentStatusUpdating(true);
    try {
      const response = await fetch(`${appointmentsEndpointBase}${selectedAppointmentId}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível atualizar o status.";
        try {
          const data = await response.json();
          if (data?.detail) {
            errorMessage = data.detail;
          }
        } catch {
          /* noop */
        }
        throw new Error(errorMessage);
      }

      setFeedbackMessage({
        type: "success",
        message: "Status do agendamento atualizado.",
      });
      refreshAppointmentDetail();
      setAppointmentsRefreshToken((previous) => previous + 1);
    } catch (err) {
      setAppointmentDetailError(
        err instanceof Error ? err.message : "Erro inesperado ao atualizar o status.",
      );
    } finally {
      setAppointmentStatusUpdating(false);
    }
  };

  const buildSlotsFromDetail = (detail: AppointmentItem) => {
    const slots: AppointmentProfessionalSlot[] = [];
    if (detail.professional_services && detail.professional_services.length > 0) {
      const added = new Set<number>();
      detail.professional_services.forEach((entry) => {
        if (added.has(entry.professional)) {
          return;
        }
        const slot = createProfessionalSlot();
        slot.professional = {
          id: entry.professional,
          name: entry.professional_name ?? `Profissional #${entry.professional}`,
        };
        slots.push(slot);
        added.add(entry.professional);
      });
      if (slots.length === 0) {
        slots.push(createProfessionalSlot());
      }
      return slots;
    }
    const slot = createProfessionalSlot();
    if (detail.professional) {
      slot.professional = {
        id: detail.professional,
        name: detail.professional_name ?? `Profissional #${detail.professional}`,
      };
    }
    slots.push(slot);
    return slots;
  };

  const prefillAppointmentFormFromDetail = (detail: AppointmentItem) => {
    const detailDate = new Date(detail.date_time);
    setAppointmentDateInput(formatDateParam(detailDate));
    setAppointmentTimeInput(formatTimeInputValue(detailDate));
    if (detail.status) {
      setSelectedAppointmentStatus(detail.status as AppointmentStatus);
    }
    const paymentType = detail.payment_type;
    if (paymentType === "credit" || paymentType === "debit" || paymentType === "pix" || paymentType === "dinheiro") {
      setSelectedPaymentType(paymentType);
    } else {
      setSelectedPaymentType(null);
    }
    setPriceInput(detail.price_paid ?? "");
    setPriceManuallyEdited(true);
    setDiscountInput(detail.discount !== null && detail.discount !== undefined ? String(detail.discount) : "0");
    setAppointmentObservations(detail.observations ?? "");
    setCreateAppointmentError(null);

    if (detail.client) {
      const clientName = detail.client_name ?? "";
      const [firstName, ...rest] = clientName.split(" ");
      setSelectedClient({
        id: detail.client,
        first_name: firstName || clientName || "Cliente",
        last_name: rest.join(" "),
        email: detail.client_name ?? "",
        phone: "",
        role: "",
        professional_profile: null,
        profile_pic: null,
      });
    } else {
      setSelectedClient(null);
    }

    const slots = buildSlotsFromDetail(detail);
    setAppointmentProfessionals(slots);

    const priceMap = new Map<number, string>();
    detail.professional_services?.forEach((entry) => {
      priceMap.set(entry.service, entry.price_paid ?? "0");
    });

    const servicesForForm: ServiceSimpleOption[] = detail.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: priceMap.get(service.id) ?? "0",
    }));

    setSelectedAppointmentServices(servicesForForm);
    setServicesPickerTempSelection(servicesForForm);

    const assignments: Record<number, ServiceAssignment> = {};
    if (detail.professional_services && detail.professional_services.length > 0) {
      const slotMap = new Map<number, string>();
      slots.forEach((slot) => {
        if (slot.professional) {
          slotMap.set(slot.professional.id, slot.id);
        }
      });
      detail.professional_services.forEach((entry) => {
        const slotId = slotMap.get(entry.professional) ?? slots[0]?.id ?? null;
        assignments[entry.service] = {
          professionalSlotId: slotId,
          price: entry.price_paid ?? priceMap.get(entry.service) ?? "0",
        };
      });
    } else {
      const defaultSlotId =
        slots.find((slot) => slot.professional)?.id ?? slots[0]?.id ?? null;
      detail.services.forEach((service) => {
        assignments[service.id] = {
          professionalSlotId: defaultSlotId,
          price: priceMap.get(service.id) ?? "0",
        };
      });
    }
    setServiceAssignments(assignments);
  };

  const handleStartAppointmentEdit = () => {
    if (!appointmentDetail) {
      return;
    }
    prefillAppointmentFormFromDetail(appointmentDetail);
    setEditingAppointmentId(appointmentDetail.id);
    setIsCreatingAppointment(true);
  };

  const handleOpenServicesPickerModal = () => {
    setServicesPickerTempSelection(selectedAppointmentServices);
    setShowServicesPickerModal(true);
  };

  const handleCancelServicesPicker = () => {
    setServicesPickerTempSelection(selectedAppointmentServices);
    setShowServicesPickerModal(false);
  };

  const handleToggleServiceInModal = (service: ServiceSimpleOption) => {
    setServicesPickerTempSelection((previous) => {
      const exists = previous.some((item) => item.id === service.id);
      if (exists) {
        return previous.filter((item) => item.id !== service.id);
      }
      return [...previous, service];
    });
  };

  const handleConfirmServicesPicker = () => {
    setSelectedAppointmentServices(servicesPickerTempSelection);
    setServiceAssignments((prev) => {
      const next: Record<number, ServiceAssignment> = {};
      servicesPickerTempSelection.forEach((service) => {
        next[service.id] =
          prev[service.id] ??
          {
            professionalSlotId: appointmentProfessionals[0]?.id ?? null,
            price: getDefaultServicePrice(service.price),
          };
      });
      return next;
    });
    setShowServicesPickerModal(false);
  };

  const handleRemoveAppointmentService = (serviceId: number) => {
    setSelectedAppointmentServices((previous) =>
      previous.filter((service) => service.id !== serviceId),
    );
    setServicesPickerTempSelection((previous) =>
      previous.filter((service) => service.id !== serviceId),
    );
    setServiceAssignments((prev) => {
      const updated = { ...prev };
      delete updated[serviceId];
      return updated;
    });
  };

  const handleAddProfessionalSlot = () => {
    setAppointmentProfessionals((previous) => [...previous, createProfessionalSlot()]);
  };

  const handleRemoveProfessionalSlot = (slotId: string) => {
    setAppointmentProfessionals((previous) => {
      if (previous.length === 1) {
        return previous;
      }
      const filtered = previous.filter((slot) => slot.id !== slotId);
      if (filtered.length === previous.length) {
        return previous;
      }
      setServiceAssignments((prevAssignments) => {
        const fallbackSlotId = filtered[0]?.id ?? null;
        const updatedEntries: Record<number, ServiceAssignment> = {};
        Object.entries(prevAssignments).forEach(([key, assignment]) => {
          updatedEntries[Number(key)] = {
            ...assignment,
            professionalSlotId:
              assignment.professionalSlotId === slotId ? fallbackSlotId : assignment.professionalSlotId,
          };
        });
        return updatedEntries;
      });
      if (professionalPickerContext?.slotId === slotId) {
        handleCloseProfessionalPicker();
      }
      return filtered;
    });
  };

  const handleOpenProfessionalPicker = (slotId: string) => {
    setProfessionalPickerContext({ slotId });
    setProfessionalSearchInput("");
    setProfessionalSearchTerm("");
    setShowProfessionalPickerModal(true);
  };

  const handleCloseProfessionalPicker = () => {
    setProfessionalPickerContext(null);
    setShowProfessionalPickerModal(false);
  };

  const handleServiceAssignmentProfessionalChange = (
    serviceId: number,
    slotId: string | null,
  ) => {
    setServiceAssignments((prev) => ({
      ...prev,
      [serviceId]: {
        professionalSlotId: slotId,
        price: prev[serviceId]?.price ?? "0.00",
      },
    }));
  };

  const handleServiceAssignmentPriceChange = (
    serviceId: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setServiceAssignments((prev) => ({
      ...prev,
      [serviceId]: {
        professionalSlotId: prev[serviceId]?.professionalSlotId ?? appointmentProfessionals[0]?.id ?? null,
        price: value,
      },
    }));
  };

  const handleSelectProfessionalForAppointment = (professional: ServiceOption) => {
    if (!professionalPickerContext) {
      handleCloseProfessionalPicker();
      return;
    }
    setAppointmentProfessionals((previous) =>
      previous.map((slot) =>
        slot.id === professionalPickerContext.slotId ? { ...slot, professional } : slot,
      ),
    );
    handleCloseProfessionalPicker();
    setCreateAppointmentError(null);
  };

  const handleSelectPaymentOption = (payment: PaymentType) => {
    setSelectedPaymentType(payment);
    setShowPaymentTypeModal(false);
  };

  const handlePriceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPriceInput(event.target.value);
    setPriceManuallyEdited(true);
  };

  const handleDiscountInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      setDiscountInput("0");
      return;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return;
    }
    if (numeric > 100) {
      setDiscountInput("100");
      return;
    }
    if (numeric < 0) {
      setDiscountInput("0");
      return;
    }
    setDiscountInput(value);
  };

  const handleResetPriceFromServices = () => {
    setPriceManuallyEdited(false);
    setPriceInput(appointmentServicesSubtotal.toFixed(2));
    setServiceAssignments((prev) => {
      const updated: Record<number, ServiceAssignment> = { ...prev };
      selectedAppointmentServices.forEach((service) => {
        updated[service.id] = {
          professionalSlotId:
            prev[service.id]?.professionalSlotId ?? appointmentProfessionals[0]?.id ?? null,
          price: getDefaultServicePrice(service.price),
        };
      });
      return updated;
    });
  };

  const handleOpenSaleModal = () => {
    if (!selectedClient) {
      setCreateAppointmentError("Selecione um cliente antes de adicionar vendas.");
      return;
    }
    setSaleModalOpen(true);
  };

  const handleCloseSaleModal = () => {
    setSaleModalOpen(false);
  };

  const handleSelectSaleProduct = (productId: number) => {
    setSelectedSaleProductId(productId);
    const product = saleProductsList.find((item) => item.id === productId);
    if (product) {
      setSalePriceInput(product.price_to_sell ?? "");
    }
  };

  const handleSaleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSaleQuantityInput(event.target.value);
  };

  const handleSalePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSalePriceInput(event.target.value);
  };

  const handleAddSaleProduct = async () => {
    if (!accessToken) {
      setCreateAppointmentError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!selectedClient) {
      setCreateAppointmentError("Selecione um cliente antes de adicionar vendas.");
      return;
    }
    if (!selectedSaleProductId) {
      setCreateAppointmentError("Selecione um produto para vender.");
      return;
    }
    if (!salePaymentSelect) {
      setCreateAppointmentError("Informe a forma de pagamento da venda.");
      return;
    }
    const quantityValue = Number(saleQuantityInput);
    if (Number.isNaN(quantityValue) || quantityValue <= 0) {
      setCreateAppointmentError("Informe uma quantidade válida para a venda.");
      return;
    }
    const priceValue = parseCurrencyInput(salePriceInput);
    if (priceValue <= 0) {
      setCreateAppointmentError("Informe um preço válido para a venda.");
      return;
    }
    const transactionDate = appointmentDateInput || formatDateParam(new Date());
    setIsAddingSaleProduct(true);
    try {
      const formData = new FormData();
      formData.append("type", "sell");
      formData.append("price", priceValue.toFixed(2));
      formData.append("date_of_transaction", transactionDate);
      formData.append("transaction_payment", salePaymentSelect);
      formData.append("quantity", quantityValue.toString());
      formData.append("user", String(selectedClient.id));
      formData.append("product", String(selectedSaleProductId));

      const response = await fetch(transactionsEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível adicionar a venda.";
        try {
          const data = await response.json();
          if (data?.detail) {
            errorMessage = data.detail;
          }
        } catch {
          /* noop */
        }
        throw new Error(errorMessage);
      }

      const pickedProduct = saleProductsList.find((item) => item.id === selectedSaleProductId);
      setAddedSales((previous) => [
        ...previous,
        {
          productId: selectedSaleProductId,
          productName: pickedProduct?.name ?? `Produto #${selectedSaleProductId}`,
          price: priceValue.toFixed(2),
          quantity: quantityValue,
          paymentType: salePaymentSelect,
        },
      ]);
      setFeedbackMessage({
        type: "success",
        message: "Produto vendido adicionado ao agendamento.",
      });
      setSaleModalOpen(false);
    } catch (err) {
      setCreateAppointmentError(
        err instanceof Error ? err.message : "Erro inesperado ao adicionar a venda.",
      );
    } finally {
      setIsAddingSaleProduct(false);
    }
  };

  const handleProductsSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductsSearchTerm(productsSearchInput.trim());
  };

  const handleClearProductsSearch = () => {
    setProductsSearchInput("");
    setProductsSearchTerm("");
  };

  const handleProductUseFilterSelect = (value: string | null) => {
    setProductUseFilter(value);
  };

  const handleProductTypeFilterSelect = (value: string | null) => {
    setProductTypeFilter(value);
  };

  const refreshProductsInventory = () => {
    setProductsRefreshToken((prev) => prev + 1);
  };

  const handleProductMoneyInputChange =
    (field: "pricePaid" | "priceToSell") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const maskedValue = formatMoneyInputValue(event.target.value);
      setCreateProductValue(field, maskedValue, { shouldDirty: true, shouldValidate: true });
    };

  const handleStartCreateProduct = useCallback(() => {
    resetCreateProductForm(createProductDefaultValues);
    setProductFormError(null);
    setIsCreatingProduct(true);
  }, [resetCreateProductForm]);

  const handleCancelCreateProduct = () => {
    setIsCreatingProduct(false);
    setProductFormError(null);
    resetCreateProductForm(createProductDefaultValues);
  };

  const handleStartCreateProductSale = useCallback(() => {
    setIsCreatingProductSale(true);
    setProductSaleError(null);
    setProductSaleSelectedProduct(null);
    setProductSalePriceInput("");
    setProductSaleQuantityInput("1");
    setProductSalePayment(null);
    setProductSaleUserIdInput("");
    setProductSaleProductModalOpen(false);
    const todayIso = formatDateParam(new Date());
    setProductSaleDateIso(todayIso);
    setProductSaleDateDisplay(formatIsoToDisplay(todayIso));
  }, []);

  const handleCancelCreateProductSale = () => {
    setIsCreatingProductSale(false);
    setProductSaleError(null);
    setProductSaleProductModalOpen(false);
    setProductSaleSelectedProduct(null);
  };

  const handleProductSalePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const maskedValue = formatMoneyInputValue(event.target.value);
    setProductSalePriceInput(maskedValue);
  };

  const handleProductSaleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDisplayDate(event.target.value);
    setProductSaleDateDisplay(formatted);
    const iso = convertDisplayDateToIso(formatted);
    if (iso) {
      setProductSaleDateIso(iso);
    } else if (!formatted) {
      setProductSaleDateIso("");
    }
  };

  const handleOpenProductSaleModal = () => {
    setProductSaleProductModalOpen(true);
  };

  const handleCloseProductSaleModal = () => {
    setProductSaleProductModalOpen(false);
  };

  const handleSelectProductForSale = (product: ProductItem) => {
    setProductSaleSelectedProduct(product);
    setProductSaleProductModalOpen(false);
    const maskedPrice = formatMoneyFromDecimalString(product.price_to_sell ?? "0");
    setProductSalePriceInput(maskedPrice);
  };

  const triggerQuickAction = (action: QuickActionKey) => {
    if (action === "create-appointment") {
      setActiveTab("agenda");
    } else {
      setActiveTab("products");
    }
    setPendingQuickAction(action);
  };

  const handleOpenSummaryFilters = () => {
    setSummaryFilterError(null);
    if (activeSummaryDay) {
      setSummaryFilterMode("day");
      setSummaryDayInput(formatIsoToDisplay(activeSummaryDay));
    } else {
      setSummaryDayInput("");
    }
    if (activeSummaryMonth) {
      setSummaryFilterMode("month");
      const [yearValue = "", monthValue = ""] = activeSummaryMonth.split("-");
      setSummaryMonthYear(yearValue);
      setSummaryMonthValue(monthValue);
    } else {
      setSummaryMonthYear("");
      setSummaryMonthValue("");
    }
    setShowSummaryFilters(true);
  };

  const handleCloseSummaryFilters = () => {
    setShowSummaryFilters(false);
  };

  const handleApplySummaryFilters = () => {
    setSummaryFilterError(null);
    if (summaryFilterMode === "day") {
      const isoValue = convertDisplayDateToIso(summaryDayInput);
      if (!isoValue) {
        setSummaryFilterError("Informe uma data válida no formato dd/mm/aaaa.");
        return;
      }
      setActiveSummaryDay(isoValue);
      setActiveSummaryMonth(null);
      setShowSummaryFilters(false);
      return;
    }
    if (!summaryMonthYear || !summaryMonthValue) {
      setSummaryFilterError("Selecione o ano e o mês.");
      return;
    }
    setActiveSummaryMonth(`${summaryMonthYear}-${summaryMonthValue}`);
    setActiveSummaryDay(null);
    setShowSummaryFilters(false);
  };

  const handleClearSummaryFilters = () => {
    setActiveSummaryDay(null);
    setActiveSummaryMonth(null);
    setSummaryDayInput("");
    setSummaryMonthYear("");
    setSummaryMonthValue("");
    setSummaryFilterError(null);
  };

  useEffect(() => {
    if (!pendingQuickAction) {
      return;
    }

    if (pendingQuickAction === "create-appointment" && activeTab === "agenda") {
      handleStartCreateAppointment();
      setPendingQuickAction(null);
      return;
    }

    if (pendingQuickAction === "create-product-sale" && activeTab === "products") {
      handleStartCreateProductSale();
      setPendingQuickAction(null);
      return;
    }

    if (pendingQuickAction === "create-product" && activeTab === "products") {
      handleStartCreateProduct();
      setPendingQuickAction(null);
    }
  }, [
    pendingQuickAction,
    activeTab,
    handleStartCreateAppointment,
    handleStartCreateProductSale,
    handleStartCreateProduct,
  ]);

  useEffect(() => {
    if (activeTab !== "finances" || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchFinanceSummary = async () => {
      setFinanceSummaryLoading(true);
      setFinanceSummaryError(null);
      try {
        const url = new URL(financeSummaryEndpoint);
        url.searchParams.set("month", financeMonth);
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar o resumo financeiro.");
        }

        const data: FinanceSummary = await response.json();
        setFinanceSummary(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setFinanceSummaryError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar o resumo financeiro.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFinanceSummaryLoading(false);
        }
      }
    };

    fetchFinanceSummary();
    return () => controller.abort();
  }, [activeTab, accessToken, financeMonth]);

  useEffect(() => {
    if (activeTab !== "finances" || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchRepasses = async () => {
      setRepassesLoading(true);
      setRepassesError(null);
      try {
        const url = new URL(repassesEndpoint);
        url.searchParams.set("month", financeMonth);
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar os repasses.");
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];
        setRepassesList(list);
      } catch (err) {
        if (!controller.signal.aborted) {
          setRepassesError(
            err instanceof Error ? err.message : "Erro inesperado ao carregar os repasses.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setRepassesLoading(false);
        }
      }
    };

    fetchRepasses();
    return () => controller.abort();
  }, [activeTab, accessToken, financeMonth]);

  useEffect(() => {
    if (activeTab !== "finances" || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchBills = async () => {
      setBillsLoading(true);
      setBillsError(null);
      try {
        const url = new URL(billsEndpointBase);
        url.searchParams.set("month", financeMonth);
        const response = await fetch(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as contas.");
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.bills)
              ? data.bills
              : [];
        setBillsList(list);
      } catch (err) {
        if (!controller.signal.aborted) {
          setBillsError(
            err instanceof Error ? err.message : "Erro inesperado ao carregar as contas.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setBillsLoading(false);
        }
      }
    };

    fetchBills();
    return () => controller.abort();
  }, [activeTab, accessToken, financeMonth]);

  const handleCreateProduct = handleSubmitCreateProduct(async (values) => {
    setProductFormError(null);
    if (!accessToken) {
      setProductFormError("Sessão expirada. Faça login novamente.");
      return;
    }

    const quantityValue = Number(values.quantity);
    const alarmValue = Number(values.alarmQuantity);
    if (Number.isNaN(quantityValue) || Number.isNaN(alarmValue)) {
      setProductFormError("Verifique os campos numéricos.");
      return;
    }

    const pricePaid = normalizeMoneyValue(values.pricePaid);
    const priceToSell = normalizeMoneyValue(values.priceToSell);
    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("price_paid", pricePaid);
    formData.append("price_to_sell", priceToSell);
    formData.append("quantity", quantityValue.toString());
    formData.append("use_type", values.useType);
    formData.append("type", values.type);
    formData.append("alarm_quantity", alarmValue.toString());
    const pictureFile =
      values.picture &&
      typeof FileList !== "undefined" &&
      values.picture instanceof FileList &&
      values.picture.length > 0
        ? values.picture[0]
        : null;
    if (pictureFile) {
      formData.append("picture_of_product", pictureFile);
    }

    setIsSavingProduct(true);
    try {
      const response = await fetch(productsEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível criar o produto.";
        try {
          const data = await response.json();
          if (data?.detail) {
            errorMessage = data.detail;
          }
        } catch {
          /* noop */
        }
        throw new Error(errorMessage);
      }

      setFeedbackMessage({
        type: "success",
        message: "Produto criado com sucesso.",
      });
      handleCancelCreateProduct();
      refreshProductsInventory();
    } catch (err) {
      setProductFormError(
        err instanceof Error ? err.message : "Erro inesperado ao criar o produto.",
      );
    } finally {
      setIsSavingProduct(false);
    }
  });

  const handleSubmitProductSale = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductSaleError(null);
    if (!accessToken) {
      setProductSaleError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!productSaleSelectedProduct) {
      setProductSaleError("Selecione um produto.");
      return;
    }
    if (!productSalePayment) {
      setProductSaleError("Escolha a forma de pagamento.");
      return;
    }
    if (!productSaleUserIdInput.trim()) {
      setProductSaleError("Informe o identificador do cliente.");
      return;
    }
    const priceValue = parseCurrencyInput(productSalePriceInput);
    if (priceValue <= 0) {
      setProductSaleError("Informe um preço válido.");
      return;
    }
    const quantityValue = Number(productSaleQuantityInput);
    if (Number.isNaN(quantityValue) || quantityValue <= 0) {
      setProductSaleError("Informe uma quantidade válida.");
      return;
    }
    const saleDateIso =
      productSaleDateIso || convertDisplayDateToIso(productSaleDateDisplay) || formatDateParam(new Date());

    const formData = new FormData();
    formData.append("type", "sell");
    formData.append("price", priceValue.toFixed(2));
    formData.append("date_of_transaction", saleDateIso);
    formData.append("transaction_payment", productSalePayment);
    formData.append("quantity", quantityValue.toString());
    formData.append("user", productSaleUserIdInput.trim());
    formData.append("product", productSaleSelectedProduct.id.toString());

    setProductSaleSubmitting(true);
    try {
      const response = await fetch(transactionsEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível registrar a venda.";
        try {
          const data = await response.json();
          if (data?.detail) {
            errorMessage = data.detail;
          }
        } catch {
          /* noop */
        }
        throw new Error(errorMessage);
      }

      setFeedbackMessage({
        type: "success",
        message: "Venda registrada com sucesso.",
      });
      handleCancelCreateProductSale();
      refreshProductsInventory();
    } catch (err) {
      setProductSaleError(
        err instanceof Error ? err.message : "Erro inesperado ao registrar a venda.",
      );
    } finally {
      setProductSaleSubmitting(false);
    }
  };

  const handleSubmitAppointment = async () => {
    setCreateAppointmentError(null);
    const isEditingExistingAppointment = editingAppointmentId !== null;
    if (!accessToken) {
      setCreateAppointmentError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!selectedClient) {
      setCreateAppointmentError("Selecione um cliente.");
      return;
    }
    if (selectedAppointmentServices.length === 0) {
      setCreateAppointmentError("Escolha pelo menos um serviço.");
      return;
    }
    if (!selectedPaymentType) {
      setCreateAppointmentError("Selecione a forma de pagamento.");
      return;
    }
    const totalPriceValue = appointmentPriceValue;
    const dateTimeIso = buildDateTimeISOString(appointmentDateInput, appointmentTimeInput);
    if (!dateTimeIso) {
      setCreateAppointmentError("Informe uma data e hora válidas.");
      return;
    }
    if (filledAppointmentProfessionals.length === 0) {
      setCreateAppointmentError("Selecione pelo menos um profissional.");
      return;
    }
    if (!hasMultipleProfessionals) {
      if (totalPriceValue <= 0) {
        setCreateAppointmentError("Informe um preço válido.");
        return;
      }
    } else {
      for (const service of selectedAppointmentServices) {
        const assignment = serviceAssignments[service.id];
        if (!assignment?.professionalSlotId) {
          setCreateAppointmentError("Defina o profissional responsável por cada serviço.");
          return;
        }
        const slot = appointmentProfessionals.find(
          (item) => item.id === assignment.professionalSlotId,
        );
        if (!slot?.professional) {
          setCreateAppointmentError("Selecione profissionais válidos para os serviços.");
          return;
        }
        const priceValue = parseCurrencyInput(assignment.price);
        if (priceValue <= 0) {
          setCreateAppointmentError("Informe o preço pago para cada serviço.");
          return;
        }
      }
    }
    setIsSavingAppointment(true);
    try {
      const basePayload = {
        date_time: dateTimeIso,
        client: selectedClient.id,
        discount: normalizedDiscount,
        payment_type: selectedPaymentType,
        status: selectedAppointmentStatus,
        observations: appointmentObservations || null,
      };
      let payload: Record<string, unknown> = basePayload;

      if (hasMultipleProfessionals) {
        const professionalServices = selectedAppointmentServices.map((service) => {
          const assignment = serviceAssignments[service.id];
          const slot = appointmentProfessionals.find(
            (item) => item.id === assignment?.professionalSlotId,
          );
          const professional = slot?.professional;
          if (!professional) {
            throw new Error("Selecione profissionais válidos para os serviços.");
          }
          const priceValue = parseCurrencyInput(assignment?.price ?? "0");
          return {
            professional: professional.id,
            service: service.id,
            price_paid: priceValue.toFixed(2),
          };
        });
        payload = {
          ...basePayload,
          professional_services: professionalServices,
        };
      } else {
        const professional = filledAppointmentProfessionals[0]?.professional;
        payload = {
          ...basePayload,
          professional: professional?.id ?? 0,
          services: selectedAppointmentServices.map((service) => service.id),
          price_paid: appointmentPriceValue.toFixed(2),
        };
      }

      const endpoint = isEditingExistingAppointment
        ? `${appointmentsEndpointBase}${editingAppointmentId}/`
        : appointmentsEndpointBase;
      const response = await fetch(endpoint, {
        method: isEditingExistingAppointment ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = isEditingExistingAppointment
          ? "Não foi possível atualizar o agendamento."
          : "Não foi possível criar o agendamento.";
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          /* noop */
        }
        throw new Error(errorMessage);
      }

      setFeedbackMessage({
        type: "success",
        message: isEditingExistingAppointment
          ? "Agendamento atualizado com sucesso."
          : "Agendamento criado com sucesso.",
      });
      setAppointmentsRefreshToken((previous) => previous + 1);
      if (isEditingExistingAppointment) {
        refreshAppointmentDetail();
      }
      setIsCreatingAppointment(false);
      resetAppointmentForm();
    } catch (err) {
      setCreateAppointmentError(
        err instanceof Error
          ? err.message
          : isEditingExistingAppointment
            ? "Erro inesperado ao atualizar o agendamento."
            : "Erro inesperado ao criar o agendamento.",
      );
    } finally {
      setIsSavingAppointment(false);
    }
  };

  const handleToggleEditUser = () => {
    if (!userDetail) {
      return;
    }
    setCanEditUser((previous) => {
      const next = !previous;
      if (!next) {
        resetEditUserForm({
          firstName: userDetail.first_name ?? "",
          lastName: userDetail.last_name ?? "",
          email: userDetail.email ?? "",
          cpf: userDetail.cpf ?? "",
          phone: userDetail.phone ?? "",
          role: userDetail.role ?? "",
          dateOfBirth: userDetail.date_of_birth ?? "",
          isActive: userDetail.is_active ?? true,
          profilePic: undefined,
        });
      }
      return next;
    });
  };

  const handleOpenClientHistory = () => {
    setShowClientHistory(true);
  };

  const handleCloseClientHistory = () => {
    setShowClientHistory(false);
    setClientHistoryData(null);
    setClientHistoryError(null);
  };

  const handleUpdateUser = handleSubmitEditUser(async (values) => {
    setFormError(null);
    if (!accessToken || !userDetail) {
      setFormError("Sessão expirada. Faça login novamente.");
      return;
    }
    const isoDate = convertDisplayDateToIso(values.dateOfBirth);
    if (!isoDate) {
      setFormError("Informe uma data de nascimento válida (dd/mm/aaaa).");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", values.firstName.trim());
    formData.append("last_name", values.lastName.trim());
    formData.append("email", values.email.trim());
    formData.append("cpf", values.cpf?.trim() ?? "");
    formData.append("phone", values.phone?.trim() ?? "");
    formData.append("role", values.role);
    formData.append("date_of_birth", isoDate);
    formData.append("is_active", values.isActive ? "true" : "false");
    if (
      values.profilePic &&
      typeof FileList !== "undefined" &&
      values.profilePic instanceof FileList &&
      values.profilePic.length > 0
    ) {
      formData.append("profile_pic", values.profilePic[0]);
    }

    setIsUpdatingUser(true);
    try {
      const response = await fetch(`${usersEndpointBase}${userDetail.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail =
          (data && (data.detail || data.message)) ||
          "Não foi possível atualizar o usuário.";
        throw new Error(detail);
      }

      const updated = (await response.json().catch(() => null)) as
        | UserDetail
        | null;
      if (updated) {
        setUserDetail(updated);
        resetEditUserForm({
          firstName: updated.first_name ?? "",
          lastName: updated.last_name ?? "",
          email: updated.email ?? "",
          cpf: updated.cpf ?? "",
          phone: updated.phone ?? "",
          role: updated.role ?? "",
          dateOfBirth: updated.date_of_birth ?? "",
          isActive: updated.is_active ?? true,
          profilePic: undefined,
        });
      }
      setFeedbackMessage({
        type: "success",
        message: "Usuário atualizado com sucesso.",
      });
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao atualizar o usuário.",
      );
    } finally {
      setIsUpdatingUser(false);
    }
  });

  const handleSaveProfessionalProfile = handleSubmitProfile(
    async (values) => {
      setFormError(null);
      if (!accessToken || !userDetail) {
        setFormError("Sessão expirada. Faça login novamente.");
        return;
      }

      const payload = {
        user: userDetail.id,
        professional_type: values.professionalType,
        cnpj: values.cnpj,
        commission: Number(values.commission),
        bio: values.bio ?? "",
        services: values.services,
      };

      setIsSavingProfile(true);
      try {
        const hasProfile = Boolean(userDetail.professional_profile);
        const endpoint = hasProfile
          ? `${professionalProfilesEndpointBase}${userDetail.professional_profile?.id}/`
          : professionalProfilesEndpointBase;
        const method = hasProfile ? "PATCH" : "POST";

        const response = await fetch(endpoint, {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const detail =
            (data && (data.detail || data.message)) ||
            "Não foi possível salvar o perfil profissional.";
          throw new Error(detail);
        }

        const rawProfile = (await response.json()) as ProfessionalProfileDetail & {
                  services?: Array<number | { id: number }>;
                };
        const normalizedServices = Array.isArray(rawProfile.services)
          ? rawProfile.services
              .map((service) => {
                if (typeof service === "number") {
                  return service;
                }
                if (service && typeof service === "object" && "id" in service) {
                  const maybeId = (service as { id?: number }).id;
                  return typeof maybeId === "number" ? maybeId : 0;
                }
                return 0;
              })
              .filter((id) => id > 0)
          : [];
        const updatedProfile: ProfessionalProfileDetail = {
          ...rawProfile,
          services: normalizedServices,
        };
        setUserDetail((prev) =>
          prev
            ? {
                ...prev,
                professional_profile: updatedProfile,
              }
            : prev,
        );
        setShowProfileForm(true);
        resetProfileForm({
          professionalType: updatedProfile.professional_type ?? "",
          cnpj: updatedProfile.cnpj ?? "",
          commission: String(updatedProfile.commission ?? ""),
          bio: updatedProfile.bio ?? "",
          services: updatedProfile.services ?? [],
        });
        setFeedbackMessage({
          type: "success",
          message: "Perfil profissional salvo com sucesso.",
        });
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : "Erro inesperado ao salvar o perfil profissional.",
        );
      } finally {
        setIsSavingProfile(false);
      }
    },
  );

  const renderProfileMenu = () => (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="h-12 w-12 overflow-hidden rounded-full border border-white/20"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <Image
          src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80"
          alt="Foto do usuário"
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </button>
      {menuOpen ? (
        <div className="absolute right-0 mt-3 w-40 rounded-2xl border border-white/10 bg-[#111] p-2 shadow-xl">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      ) : null}

    </div>
  );

  const renderHomeContent = () => {
    const revenueValue = formatCurrency(dailySummary?.revenue ?? "0");
    const appointmentsValue = formatCurrency(dailySummary?.appointments_value ?? "0");
    const sellValue = formatCurrency(dailySummary?.sell_value ?? "0");
    const nextAppointmentInfo = dailySummary?.next_appointment ?? null;
    const nextAppointmentDate = nextAppointmentInfo
      ? new Date(nextAppointmentInfo.date_time)
      : null;
    const nextAppointmentLabel = nextAppointmentDate
      ? nextAppointmentDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })
      : "--";
    const nextAppointmentTime = nextAppointmentDate
      ? nextAppointmentDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";
    const professionalBreakdown = dailySummary?.appointments_by_professional ?? [];
    const maxProfessionalTotal = professionalBreakdown.reduce(
      (acc, item) => Math.max(acc, item.total),
      1,
    );
    const topServicesData = dailySummary?.top_services ?? [];
    const quickActions = [
      {
        key: "create-appointment" as QuickActionKey,
        title: "Abra um atendimento",
        subtitle: "Crie um novo agendamento",
        bg: "bg-white text-black",
        image: "/relogio_urus.png",
      },
      {
        key: "create-product-sale" as QuickActionKey,
        title: "Venda um produto",
        subtitle: "Registre uma venda",
        bg: "bg-[#3F8A60] text-white",
        image: "/lata_urus.png",
      },
      {
        key: "create-product" as QuickActionKey,
        title: "Adicionar produto",
        subtitle: "Organize seu estoque",
        bg: "bg-[#3268D8] text-white",
        image: "/caixa_urus.png",
      },
    ];

    return (
      <>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Home</p>
            <p className="text-2xl font-semibold">Bem-vindo, {firstName}</p>
          </div>
          {renderProfileMenu()}
        </header>

        {dailySummaryError ? (
          <div className="mb-4 rounded-3xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {dailySummaryError}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-white/60">Faturamento diário</p>
              <p className="mt-2 text-3xl font-semibold">
                {dailySummaryLoading ? "..." : revenueValue}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              {dailySummary?.total_services_performed ?? 0} serviços
            </span>
            <button
              type="button"
              onClick={handleOpenSummaryFilters}
              className="rounded-2xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40"
            >
              Filtros
            </button>
          </div>
          {activeSummaryDay || activeSummaryMonth ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
              <span>
                {activeSummaryDay
                  ? `Filtrando por dia: ${formatIsoToDisplay(activeSummaryDay)}`
                  : `Filtrando por mês: ${activeSummaryMonth}`}
              </span>
              <button
                type="button"
                onClick={handleClearSummaryFilters}
                className="text-white/80 underline-offset-2 hover:text-white hover:underline"
              >
                Limpar filtro
              </button>
            </div>
          ) : null}
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Serviços:{" "}
              <span className="font-semibold text-white">
                {dailySummaryLoading ? "..." : appointmentsValue}
              </span>
            </p>
            <p>
              Produtos:{" "}
              <span className="font-semibold text-white">
                {dailySummaryLoading ? "..." : sellValue}
              </span>
            </p>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-semibold">Ações rápidas</p>
            <span className="text-xs text-white/50">Otimize seu fluxo</span>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
            {quickActions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => triggerQuickAction(action.key)}
                className={`flex min-w-[286px] min-h-[120px] flex-1 items-center justify-between gap-3 rounded-3xl p-5 text-left shadow-card ${action.bg}`}
              >
                <div>
                  <p className="text-base font-semibold">{action.title}</p>
                  <p className="text-xs opacity-80">{action.subtitle}</p>
                </div>
                <div className="relative h-[106px] w-[106px] flex-shrink-0">
                  <Image
                    src={action.image}
                    alt={action.title}
                    fill
                    sizes="106px"
                    className="object-contain"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <p className="text-sm text-white/60">Próximo agendamento</p>
          {dailySummaryLoading ? (
            <p className="mt-4 text-sm text-white/60">Carregando...</p>
          ) : nextAppointmentInfo ? (
            <>
              <p className="mt-3 text-xl font-semibold">
                {nextAppointmentTime} • {nextAppointmentInfo.client_name}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {nextAppointmentLabel} • com {nextAppointmentInfo.professional_name}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/60">Nenhum agendamento encontrado.</p>
          )}
        </section>

        <section className="mt-5 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Atendimentos por profissional</p>
            <span className="text-xs text-white/60">Hoje</span>
          </div>
          {dailySummaryLoading ? (
            <div className="flex items-center justify-center py-10 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : professionalBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">Nenhum atendimento registrado.</p>
          ) : (
            <div className="mt-6 flex items-end justify-between gap-3">
              {professionalBreakdown.map((item) => {
                const total = Math.max(item.total, 0);
                const heightPercent = Math.min((total / maxProfessionalTotal) * 100, 100);
                return (
                  <div key={item.professional_id} className="flex flex-1 flex-col items-center">
                    <div className="relative mb-3 flex h-32 w-full items-end rounded-2xl bg-white/[0.04] p-1">
                      <span
                        className="w-full rounded-2xl bg-gradient-to-t from-white to-white/60"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/70 text-center">
                      {item.professional_name}
                    </p>
                    <p className="text-sm font-semibold text-white">{item.total}</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <span className="h-3 w-3 rounded-full bg-white" />
            Serviços executados
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <p className="text-lg font-semibold">Top serviços</p>
          {dailySummaryLoading ? (
            <p className="mt-4 text-sm text-white/60">Carregando...</p>
          ) : topServicesData.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">Nenhum serviço destacado hoje.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {topServicesData.map((service) => (
                <article
                  key={service.service_id}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3"
                >
                  <div>
                    <p className="text-base font-semibold">{service.service_name}</p>
                    <p className="text-xs text-white/60">Serviços executados</p>
                  </div>
                  <span className="rounded-full bg-black px-3 py-1 text-sm">
                    {service.total}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    );
  };

  const renderCreateUserScreen = () => (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={handleCancelCreateUser}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-white/60">Usuários</p>
          <p className="text-2xl font-semibold">Novo usuário</p>
          <p className="text-xs text-white/50">Preencha os dados abaixo</p>
        </div>
      </header>

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-white/70">
              Primeiro nome
              <input
                type="text"
                {...registerCreateUser("firstName")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  createUserErrors.firstName ? "border-red-500/60" : "border-white/10"
                }`}
              />
              {createUserErrors.firstName ? (
                <p className="mt-1 text-xs text-red-400">
                  {createUserErrors.firstName.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Sobrenome
              <input
                type="text"
                {...registerCreateUser("lastName")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  createUserErrors.lastName ? "border-red-500/60" : "border-white/10"
                }`}
              />
              {createUserErrors.lastName ? (
                <p className="mt-1 text-xs text-red-400">
                  {createUserErrors.lastName.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              E-mail
              <input
                type="email"
                {...registerCreateUser("email")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  createUserErrors.email ? "border-red-500/60" : "border-white/10"
                }`}
              />
              {createUserErrors.email ? (
                <p className="mt-1 text-xs text-red-400">
                  {createUserErrors.email.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Telefone
              <input
                type="tel"
                {...registerCreateUser("phone")}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
            <label className="text-sm text-white/70">
              CPF (opcional)
              <input
                type="text"
                {...registerCreateUser("cpf")}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
            <label className="text-sm text-white/70">
              Função
              <select
                {...registerCreateUser("role")}
                className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  createUserErrors.role ? "border-red-500/60" : "border-white/10"
                }`}
              >
                {roleOptions.length === 0 ? (
                  <option value="" disabled>
                    Carregando opções...
                  </option>
                ) : (
                  <>
                    <option value="" disabled>
                      Selecione
                    </option>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {createUserErrors.role ? (
                <p className="mt-1 text-xs text-red-400">
                  {createUserErrors.role.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Data de nascimento
              <div
                className={`mt-1 flex items-center rounded-2xl border bg-transparent px-3 focus-within:border-white/40 ${
                  createUserErrors.dateOfBirth ? "border-red-500/60" : "border-white/10"
                }`}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/aaaa"
                  value={dateOfBirthValue}
                  onChange={handleDateInputChange}
                  className="w-full bg-transparent px-1 py-3 text-sm outline-none"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={handleOpenDatePicker}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                  aria-label="Abrir calendário"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <input
                  ref={datePickerRef}
                  type="date"
                  value={datePickerValue}
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handleDatePickerChange}
                />
              </div>
              {createUserErrors.dateOfBirth ? (
                <p className="mt-1 text-xs text-red-400">
                  {createUserErrors.dateOfBirth.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Senha
              <div
                className={`mt-1 flex items-center rounded-2xl border bg-transparent px-1 focus-within:border-white/40 ${
                  createUserErrors.password ? "border-red-500/60" : "border-white/10"
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  {...registerCreateUser("password")}
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${passwordStrengthColor}`}
                    style={{ width: `${passwordStrengthPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-medium text-white/60">
                  Força da senha
                </p>
                <p className="text-xs text-white/40">
                  A senha deve conter ao menos 8 caracteres, letras maiúsculas, minúsculas, números e caracteres especiais.
                </p>
                <ul className="mt-2 space-y-1">
                  {Object.entries(passwordRequirementLabels).map(([key, label]) => {
                    const met =
                      passwordChecks[key as keyof typeof passwordRequirementLabels];
                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-2 text-xs ${
                          met ? "text-emerald-300" : "text-white/50"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            met
                              ? "border-emerald-400 bg-emerald-400/20"
                              : "border-white/30"
                          }`}
                        >
                          {met ? <Check className="h-3 w-3" /> : null}
                        </span>
                        {label}
                      </li>
                    );
                  })}
                </ul>
              </div>
              {createUserErrors.password ? (
                <p className="mt-1 text-xs text-red-400">
                  {createUserErrors.password.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Digite novamente a senha
              <div
                className={`mt-1 flex items-center rounded-2xl border bg-transparent px-1 focus-within:border-white/40 ${
                  passwordsMatch && !createUserErrors.confirmPassword
                    ? "border-white/10"
                    : "border-red-500/60"
                }`}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...registerCreateUser("confirmPassword")}
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                  aria-label={
                    showConfirmPassword
                      ? "Esconder confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {createUserErrors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-400">
                  {createUserErrors.confirmPassword.message}
                </p>
              ) : !passwordsMatch ? (
                <p className="mt-1 text-xs text-red-400">As senhas não conferem.</p>
              ) : null}
            </label>
          </div>

          {formError ? (
            <p className="text-sm text-red-300">{formError}</p>
          ) : null}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancelCreateUser}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingUser}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingUser ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar usuário"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );

  const pieColors = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

  const renderClientHistoryScreen = () => {
    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={handleCloseClientHistory}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Cliente</p>
            <p className="text-xl font-semibold">
              Histórico de {userDetail?.first_name} {userDetail?.last_name}
            </p>
          </div>
          {renderProfileMenu()}
        </header>

        {clientHistoryLoading ? (
          <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 text-white/70">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="ml-2 text-sm">Carregando histórico...</p>
          </div>
        ) : clientHistoryError ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            {clientHistoryError}
          </div>
        ) : clientHistoryData ? (
          <>
            <section className="grid gap-4 min-[320px]:grid-cols-2">
              <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
                <p className="text-sm text-white/60">Total de serviços</p>
                <p className="mt-2 text-xl font-semibold">
                  {clientHistoryData.total_appointments}
                </p>
              </article>
              <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
                <p className="text-sm text-white/60">Total gasto</p>
                <p className="mt-2 text-xl font-semibold">
                  R$ {Number(clientHistoryData.total_paid_completed).toFixed(2)}
                </p>
              </article>
            </section>

            <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <h3 className="text-lg font-semibold">Atendimentos por profissional</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={clientHistoryData.appointments_by_professional}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {clientHistoryData.appointments_by_professional.map((entry, index) => (
                        <Cell key={entry.id} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0b0b0b",
                        borderRadius: 12,
                        borderColor: "#222",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 text-sm text-white/80">
                {clientHistoryData.appointments_by_professional.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                      />
                      {item.name}
                    </span>
                    <span className="text-white/60">{item.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <h3 className="text-lg font-semibold">Serviços realizados</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <BarChart data={clientHistoryData.appointments_by_service}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#fff", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#fff", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0b0b0b",
                        borderRadius: 12,
                        borderColor: "#222",
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 8, 8]} fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        ) : null}
      </div>
    );
  };

  const renderCreateProductScreen = () => {
    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={handleCancelCreateProduct}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Produtos</p>
            <p className="text-2xl font-semibold">Adicionar produto</p>
          </div>
        </header>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <label className="text-sm text-white/70">
              Nome
              <input
                type="text"
                placeholder="Nome do produto"
                {...registerCreateProduct("name")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${createProductErrors.name ? "border-red-500/60" : "border-white/10"}`}
              />
              {createProductErrors.name ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.name.message}
                </span>
              ) : null}
            </label>

            <label className="text-sm text-white/70">
              Preço de custo
              <input
                type="text"
                placeholder="R$ 0,00"
                {...registerCreateProduct("pricePaid")}
                value={createProductPricePaidValue}
                onChange={handleProductMoneyInputChange("pricePaid")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${createProductErrors.pricePaid ? "border-red-500/60" : "border-white/10"}`}
              />
              {createProductErrors.pricePaid ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.pricePaid.message}
                </span>
              ) : null}
            </label>

            <label className="text-sm text-white/70">
              Preço de venda
              <input
                type="text"
                placeholder="R$ 0,00"
                {...registerCreateProduct("priceToSell")}
                value={createProductPriceToSellValue}
                onChange={handleProductMoneyInputChange("priceToSell")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${createProductErrors.priceToSell ? "border-red-500/60" : "border-white/10"}`}
              />
              {createProductErrors.priceToSell ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.priceToSell.message}
                </span>
              ) : null}
            </label>

            <label className="text-sm text-white/70">
              Quantidade em estoque
              <input
                type="number"
                min={0}
                {...registerCreateProduct("quantity")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${createProductErrors.quantity ? "border-red-500/60" : "border-white/10"}`}
              />
              {createProductErrors.quantity ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.quantity.message}
                </span>
              ) : null}
            </label>

            <label className="text-sm text-white/70">
              Tipo de uso
              <select
                {...registerCreateProduct("useType")}
                className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${createProductErrors.useType ? "border-red-500/60" : "border-white/10"}`}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {productUseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {createProductErrors.useType ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.useType.message}
                </span>
              ) : null}
            </label>

            <label className="text-sm text-white/70">
              Tipo
              <select
                {...registerCreateProduct("type")}
                className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${createProductErrors.type ? "border-red-500/60" : "border-white/10"}`}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {productTypeOptionsForm.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {createProductErrors.type ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.type.message}
                </span>
              ) : null}
            </label>

            <label className="text-sm text-white/70">
              Estoque mínimo (alerta)
              <input
                type="number"
                min={0}
                {...registerCreateProduct("alarmQuantity")}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${createProductErrors.alarmQuantity ? "border-red-500/60" : "border-white/10"}`}
              />
              {createProductErrors.alarmQuantity ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.alarmQuantity.message}
                </span>
              ) : null}
            </label>

            <label className="text-sm text-white/70">
              Foto do produto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                {...registerCreateProduct("picture")}
                className="mt-1 w-full rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
              <span className="mt-1 block text-xs text-white/50">
                Escolha uma foto da galeria ou utilize a câmera do celular para registrar o produto.
              </span>
              {createProductErrors.picture ? (
                <span className="mt-1 block text-xs text-red-400">
                  {createProductErrors.picture.message as string}
                </span>
              ) : null}
            </label>

            {productFormError ? (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {productFormError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCancelCreateProduct}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingProduct}
                className="flex-1 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingProduct ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  "Adicionar produto"
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  };

  const renderCreateProductSaleScreen = () => {
    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={handleCancelCreateProductSale}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Produtos</p>
            <p className="text-2xl font-semibold">Adicionar venda</p>
          </div>
        </header>

        <form onSubmit={handleSubmitProductSale} className="space-y-4">
          <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Produto</p>
                <p className="text-lg font-semibold">Selecione o item</p>
              </div>
              <button
                type="button"
                onClick={handleOpenProductSaleModal}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                <Search className="h-4 w-4" />
                Buscar produto
              </button>
            </div>
            {productSaleSelectedProduct ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white/5">
                  {productSaleSelectedProduct.picture_of_product ? (
                    <Image
                      src={productSaleSelectedProduct.picture_of_product}
                      alt={productSaleSelectedProduct.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/60">
                      Sem foto
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{productSaleSelectedProduct.name}</p>
                  <p className="text-xs text-white/60">
                    Disponível: {productSaleSelectedProduct.quantity} un
                  </p>
                  <p className="text-xs text-white/60">
                    Preço sugerido: {formatCurrency(productSaleSelectedProduct.price_to_sell ?? "0")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">
                Nenhum produto selecionado.
              </p>
            )}
          </section>

          <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
            <label className="text-sm text-white/70">
              Preço da venda
              <input
                type="text"
                placeholder="R$ 0,00"
                value={productSalePriceInput}
                onChange={handleProductSalePriceChange}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>

            <label className="text-sm text-white/70">
              Quantidade
              <input
                type="number"
                min={1}
                value={productSaleQuantityInput}
                onChange={(event) => setProductSaleQuantityInput(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>

            <div>
              <p className="text-sm text-white/70">Forma de pagamento</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {productSalePaymentOptions.map((option) => {
                  const isActive = productSalePayment === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProductSalePayment(option.value)}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="text-sm text-white/70">
              Data da venda
              <input
                type="text"
                value={productSaleDateDisplay}
                onChange={handleProductSaleDateChange}
                placeholder="dd/mm/aaaa"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>

            <label className="text-sm text-white/70">
              Cliente (ID)
              <input
                type="text"
                value={productSaleUserIdInput}
                onChange={(event) => setProductSaleUserIdInput(event.target.value)}
                placeholder="Informe o identificador do cliente"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
          </section>

          {productSaleError ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {productSaleError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCancelCreateProductSale}
              className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={productSaleSubmitting}
              className="flex-1 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {productSaleSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </span>
              ) : (
                "Adicionar venda"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderProductsContent = () => {
    if (isCreatingProduct) {
      return renderCreateProductScreen();
    }
    if (isCreatingProductSale) {
      return renderCreateProductSaleScreen();
    }
    return (
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-white/60">Produtos</p>
              <p className="text-2xl font-semibold">Controle de estoque</p>
              <p className="text-xs text-white/60">{productsInventoryCount} item(ns)</p>
            </div>
            <div className="flex flex-col gap-2 text-sm sm:flex-row">
              <button
                type="button"
                onClick={handleStartCreateProductSale}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                <DollarSign className="h-4 w-4" />
                Adicionar venda
              </button>
              <button
                type="button"
                onClick={handleStartCreateProduct}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <Plus className="h-4 w-4" />
                Novo produto
              </button>
            </div>
          </div>
        </header>

        <form onSubmit={handleProductsSearchSubmit} className="relative" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={productsSearchInput}
            onChange={(event) => setProductsSearchInput(event.target.value)}
            placeholder="Buscar por nome ou categoria"
            className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-28 text-sm outline-none transition focus:border-white/40"
          />
          {productsSearchTerm ? (
            <button
              type="button"
              onClick={handleClearProductsSearch}
              className="absolute right-24 top-1/2 -translate-y-1/2 text-xs text-white/60"
            >
              Limpar
            </button>
          ) : null}
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Buscar
          </button>
        </form>

        <div className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div>
            <p className="text-sm text-white/60">Uso</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {productUseFilterOptions.map((option) => {
                const isActive = productUseFilter === option.value;
                return (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => handleProductUseFilterSelect(option.value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm text-white/60">Tipo</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {productTypeFilterOptions.map((option) => {
                const isActive = productTypeFilter === option.value;
                return (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => handleProductTypeFilterSelect(option.value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Estoque atualizado</h3>
            <button
              type="button"
              onClick={refreshProductsInventory}
              className="text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
            >
              Atualizar
            </button>
          </div>

          {productsInventoryLoading ? (
            <div className="flex items-center justify-center py-10 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : productsInventoryError ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {productsInventoryError}
            </p>
          ) : productsInventory.length === 0 ? (
            <p className="rounded-2xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">
              Nenhum produto cadastrado no momento.
            </p>
          ) : (
            <ul className="space-y-3">
              {productsInventory.map((product) => {
                const showAlarm = product.quantity === product.alarm_quantity;
                const readableType = capitalizeFirstLetter(
                  (product.type ?? "").replace(/_/g, " "),
                );
                return (
                  <li
                    key={product.id}
                    className="flex items-center gap-4 rounded-3xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white/5">
                      {product.picture_of_product ? (
                        <Image
                          src={product.picture_of_product}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] text-white/60">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-base font-semibold">{product.name}</p>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-white/70">
                          {capitalizeFirstLetter(product.use_type ?? "")}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">Tipo: {readableType}</p>
                      <p className="text-xs text-white/60">
                        Preço de venda: {formatCurrency(product.price_to_sell ?? "0")}
                      </p>
                      <p className="flex items-center gap-2 text-xs text-white/60">
                        Quantidade:{" "}
                        <span className="text-sm font-semibold text-white">
                          {product.quantity}
                        </span>
                        {showAlarm ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                            <AlertTriangle className="h-3 w-3" />
                            Atenção
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    );
  };

  const renderCreateAppointmentScreen = () => {
    const isEditingExisting = editingAppointmentId !== null;
    const clientName = selectedClient
      ? [selectedClient.first_name, selectedClient.last_name].filter(Boolean).join(" ") ||
        selectedClient.email
      : "Selecionar";
    const professionalName = hasMultipleProfessionals
      ? "Múltiplos profissionais"
      : filledAppointmentProfessionals[0]?.professional?.name ?? "Selecionar";
    const paymentLabel =
      selectedPaymentType
        ? paymentTypeOptions.find((option) => option.value === selectedPaymentType)?.label ??
          "Selecionar"
        : "Selecionar";

    const appointmentDateTimeIso = buildDateTimeISOString(
      appointmentDateInput,
      appointmentTimeInput,
    );
    const appointmentDateTimeLabel = appointmentDateTimeIso
      ? new Date(appointmentDateTimeIso).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Defina data e hora";

    return (
      <>
        <div className="flex flex-col gap-5 pb-24">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={handleCancelCreateAppointment}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Agenda</p>
            <p className="text-2xl font-semibold">
              {isEditingExisting ? "Editar agendamento" : "Novo agendamento"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSubmitAppointment}
            disabled={isSavingAppointment}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingAppointment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSavingAppointment ? "Salvando..." : "Salvar"}
          </button>
        </header>

        <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <p className="text-sm text-white/60">Data e hora</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/70">
              Data
              <input
                type="date"
                value={appointmentDateInput}
                onChange={(event) => setAppointmentDateInput(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
            <label className="text-sm text-white/70">
              Hora
              <input
                type="time"
                value={appointmentTimeInput}
                onChange={(event) => setAppointmentTimeInput(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div>
            <p className="text-sm text-white/60">Status</p>
            <p className="text-lg font-semibold">Situação do atendimento</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {appointmentStatusOptions.map((option) => {
              const isActive = option.value === selectedAppointmentStatus;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSelectedAppointmentStatus(option.value)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Serviços</p>
              <p className="text-lg font-semibold">Monte o combo ideal</p>
              <p className="text-xs text-white/60">Selecione um ou mais serviços.</p>
            </div>
            <button
              type="button"
              onClick={handleOpenServicesPickerModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              <Plus className="h-4 w-4" />
              Selecionar
            </button>
          </div>
          {selectedAppointmentServices.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/60">
              Nenhum serviço selecionado até o momento.
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-white/80">
              {selectedAppointmentServices.map((service) => {
                const assignment = serviceAssignments[service.id];
                const currentProfessional = appointmentProfessionals.find(
                  (slot) => slot.id === assignment?.professionalSlotId,
                )?.professional;
                return (
                  <li
                    key={service.id}
                    className="rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-white/60">{formatCurrency(service.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAppointmentService(service.id)}
                        className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white"
                        aria-label="Remover serviço"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs text-white/60">
                        Profissional responsável
                        <select
                          value={assignment?.professionalSlotId ?? ""}
                          onChange={(event) =>
                            handleServiceAssignmentProfessionalChange(
                              service.id,
                              event.target.value || null,
                            )
                          }
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-sm text-white outline-none focus:border-white/40"
                        >
                          <option value="">Selecione</option>
                          {appointmentProfessionals
                            .filter((slot) => slot.professional)
                            .map((slot) => (
                              <option key={slot.id} value={slot.id}>
                                {slot.professional?.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="text-xs text-white/60">
                        Preço pago (R$)
                        <input
                          type="text"
                          inputMode="decimal"
                          value={assignment?.price ?? ""}
                          onChange={(event) => handleServiceAssignmentPriceChange(service.id, event)}
                          placeholder="0.00"
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
                        />
                      </label>
                    </div>
                    {currentProfessional ? (
                      <p className="mt-2 text-xs text-white/50">
                        Profissional selecionado: <span className="text-white">{currentProfessional.name}</span>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-right text-sm text-white/60">
            Subtotal dos serviços:{" "}
            <span className="font-semibold text-white">
              {formatCurrency(servicesGrossTotal.toFixed(2))}
            </span>
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white/60">Cliente</p>
            <button
              type="button"
              onClick={handleOpenClientRegistrationModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              <Plus className="h-3 w-3" />
              Registrar cliente
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowClientPickerModal(true)}
            className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{clientName}</p>
                <p className="text-xs text-white/60">
                  {selectedClient?.email ?? "Buscar cliente pelo nome"}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50" />
          </button>
        </section>

        <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white/60">Profissionais</p>
            <button
              type="button"
              onClick={handleAddProfessionalSlot}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              <Plus className="h-3 w-3" />
              Adicionar outro profissional
            </button>
          </div>
          <div className="space-y-2">
            {appointmentProfessionals.map((slot, index) => {
              const slotLabel = slot.professional?.name ?? "Selecionar";
              return (
                <div key={slot.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenProfessionalPicker(slot.id)}
                    className="flex flex-1 items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{slotLabel}</p>
                        <p className="text-xs text-white/60">
                          {`Profissional ${index + 1}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/50" />
                  </button>
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveProfessionalSlot(slot.id)}
                      className="rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white"
                      aria-label="Remover profissional"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div>
            <p className="text-sm text-white/60">Pagamento</p>
            <p className="text-lg font-semibold">Defina valores e condição</p>
          </div>
          <label className="block text-sm text-white/70">
            Preço (R$)
            <input
              type="text"
              value={priceInput}
              onChange={handlePriceInputChange}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
          {selectedAppointmentServices.length > 0 ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetPriceFromServices}
                className="text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
              >
                Recalcular com base nos serviços
              </button>
            </div>
          ) : null}
          <label className="block text-sm text-white/70">
            Desconto (%)
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={discountInput}
              onChange={handleDiscountInputChange}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowPaymentTypeModal(true)}
            className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-semibold">{paymentLabel}</p>
              <p className="text-xs text-white/60">Forma de pagamento</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50" />
          </button>
        </section>

        <section className="space-y-2 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <label className="text-sm text-white/70">
            Observações
            <textarea
              value={appointmentObservations}
              onChange={(event) => setAppointmentObservations(event.target.value)}
              placeholder="Informe preferências, alergias ou detalhes importantes."
              rows={3}
              className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </label>
        </section>

        <fieldset className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">
            Venda
          </legend>
          <p className="text-sm text-white/70">
            Registre a venda de produtos complementares e vincule ao agendamento.
          </p>
          <button
            type="button"
            onClick={handleOpenSaleModal}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
          >
            <Plus className="h-4 w-4" />
            Adicionar venda
          </button>
          {addedSales.length === 0 ? (
            <p className="text-xs text-white/60">Nenhuma venda adicionada ainda.</p>
          ) : (
            <ul className="space-y-2 text-sm text-white/80">
              {addedSales.map((sale, index) => (
                <li
                  key={`${sale.productId}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2"
                >
                  <div>
                    <p className="font-semibold">{sale.productName}</p>
                    <p className="text-xs text-white/60">
                      {sale.quantity} un • {getPaymentTypeLabel(sale.paymentType)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(sale.price)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {createAppointmentError ? (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {createAppointmentError}
          </p>
        ) : null}

        <fieldset className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">
            Resumo
          </legend>
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70">
            <p>
              Profissional: <span className="font-semibold text-white">{professionalName}</span>
            </p>
            <p>
              Data e hora: <span className="font-semibold text-white">{appointmentDateTimeLabel}</span>
            </p>
            <p>
              Status:{" "}
              <span className="font-semibold text-white">
                {capitalizeFirstLetter(selectedAppointmentStatus)}
              </span>
            </p>
            <p>
              Pagamento: <span className="font-semibold text-white">{paymentLabel}</span>
            </p>
          </div>
          <div className="space-y-2 text-sm text-white/80">
            {selectedAppointmentServices.length === 0 ? (
              <p className="text-white/60">Nenhum serviço selecionado.</p>
            ) : (
              selectedAppointmentServices.map((service) => {
                const assignment = serviceAssignments[service.id];
                const slot = appointmentProfessionals.find(
                  (item) => item.id === assignment?.professionalSlotId,
                );
                const professionalLabel = slot?.professional?.name ?? "Não definido";
                const paidValue = formatCurrency(
                  parseCurrencyInput(assignment?.price ?? service.price ?? "0").toFixed(2),
                );
                return (
                  <div
                    key={`summary-${service.id}`}
                    className="space-y-1 rounded-2xl border border-white/10 px-4 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{service.name}</p>
                      <span className="text-sm font-semibold text-white">{paidValue}</span>
                    </div>
                    <p className="text-xs text-white/60">
                      Profissional: <span className="font-medium text-white">{professionalLabel}</span>
                    </p>
                  </div>
                );
              })
            )}
          </div>
          {addedSales.length > 0 ? (
            <div className="space-y-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70">
              <p className="font-semibold text-white">Vendas adicionais</p>
              {addedSales.map((sale, index) => (
                <div
                  key={`sale-summary-${sale.productId}-${index}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p>{sale.productName}</p>
                    <p className="text-xs text-white/60">
                      {sale.quantity} un • {getPaymentTypeLabel(sale.paymentType)}
                    </p>
                  </div>
                  <span className="font-semibold text-white">{formatCurrency(sale.price)}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
            <div className="flex items-center justify-between text-base font-semibold text-white">
              <span>Total a receber</span>
              <span>{formatCurrency(appointmentGrandTotal.toFixed(2))}</span>
            </div>
            <p className="mt-1 text-xs text-white/60">
              Desconto aplicado (serviços): {normalizedDiscount}% (
              {formatCurrency(servicesDiscountAmount.toFixed(2))})
            </p>
            {addedSales.length > 0 ? (
              <p className="text-xs text-white/60">
                Vendas adicionais:{" "}
                <span className="font-semibold text-white">
                  {formatCurrency(addedSalesTotal.toFixed(2))}
                </span>
              </p>
            ) : null}
          </div>
        </fieldset>
        </div>
        {showClientRegistrationModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Cliente</p>
                  <h2 className="text-xl font-semibold">Registrar cliente</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowClientRegistrationModal(false);
                    setClientRegistrationError(null);
                  }}
                  className="rounded-full border border-white/10 p-2 text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmitClientRegistration} className="space-y-3">
                <label className="block text-sm text-white/70">
                  Nome
                  <input
                    type="text"
                    name="firstName"
                    value={clientRegistrationForm.firstName}
                    onChange={handleClientRegistrationInputChange}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    placeholder="João"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Sobrenome
                  <input
                    type="text"
                    name="lastName"
                    value={clientRegistrationForm.lastName}
                    onChange={handleClientRegistrationInputChange}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    placeholder="Silva"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={clientRegistrationForm.email}
                    onChange={handleClientRegistrationInputChange}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    placeholder="joao.silva@example.com"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  CPF
                  <input
                    type="text"
                    name="cpf"
                    value={clientRegistrationForm.cpf}
                    onChange={handleClientRegistrationInputChange}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    placeholder="12345678910"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Telefone
                  <input
                    type="tel"
                    name="phone"
                    value={clientRegistrationForm.phone}
                    onChange={handleClientRegistrationInputChange}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    placeholder="71988887777"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Data de nascimento
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={clientRegistrationForm.dateOfBirth}
                    onChange={handleClientRegistrationInputChange}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                  />
                </label>
                {clientRegistrationError ? (
                  <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
                    {clientRegistrationError}
                  </p>
                ) : null}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClientRegistrationModal(false);
                      setClientRegistrationError(null);
                    }}
                    className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={clientRegistrationSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {clientRegistrationSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const renderAppointmentDetailScreen = () => {
    const detail = appointmentDetail;
    const clientName = detail?.client_name ?? "Cliente não informado";
    const professionalName = detail?.professional_name ?? "Profissional não informado";
    const appointmentDateLabel = detail
      ? new Date(detail.date_time).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--/--/----";
    const createdAtLabel = detail?.created_at
      ? new Date(detail.created_at).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Não informado";
    const updatedAtLabel = detail?.updated_at
      ? new Date(detail.updated_at).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Não informado";
    const paymentLabel = getPaymentTypeLabel(detail?.payment_type as PaymentType);
    const statusValue = detail?.status as AppointmentStatus | undefined;

    return (
      <div className="flex flex-col gap-5 pb-24">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={handleCloseAppointmentDetail}
            aria-label="Voltar para agenda"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Agendamento #{selectedAppointmentId}</p>
            <p className="text-2xl font-semibold">{clientName}</p>
          </div>
          <button
            type="button"
            onClick={handleStartAppointmentEdit}
            disabled={!detail || appointmentDetailLoading}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PenSquare className="h-4 w-4" />
            Editar atendimento
          </button>
        </header>

        {appointmentDetailLoading && !detail ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-white/5 bg-[#0b0b0b] p-10 text-white/70">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="mt-3 text-sm">Carregando agendamento...</p>
          </div>
        ) : null}

        {appointmentDetailError && !detail ? (
          <div className="space-y-3 rounded-3xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-100">
            <p>{appointmentDetailError}</p>
            <button
              type="button"
              onClick={refreshAppointmentDetail}
              className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {detail ? (
          <>
            <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <div>
                <p className="text-sm text-white/60">Status</p>
                <p className="text-lg font-semibold">Atualize a situação do atendimento</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {appointmentStatusOptions.map((option) => {
                  const isActive = option.value === statusValue;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleUpdateAppointmentStatus(option.value)}
                      disabled={appointmentStatusUpdating || appointmentDetailLoading}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        isActive ? "bg-white text-black" : "bg-white/10 text-white/70"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Cliente</p>
                  <p className="text-base font-semibold text-white">{clientName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Profissional</p>
                  <p className="text-base font-semibold text-white">{professionalName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Data e hora</p>
                  <p className="text-base font-semibold text-white">{appointmentDateLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Pagamento</p>
                  <p className="text-base font-semibold text-white">{paymentLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Valor pago</p>
                  <p className="text-base font-semibold text-white">
                    {formatCurrency(detail.price_paid ?? "0")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Desconto</p>
                  <p className="text-base font-semibold text-white">
                    {detail.discount ? `${detail.discount}%` : "Sem desconto"}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Serviços</p>
                  <p className="text-lg font-semibold">Itens do atendimento</p>
                </div>
                <span className="text-xs text-white/60">{detail.services.length} item(ns)</span>
              </div>
              {detail.services.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
                  Nenhum serviço associado.
                </p>
              ) : (
                <ul className="space-y-2">
                  {detail.services.map((service) => (
                    <li
                      key={`detail-service-${service.id}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-white/60">{service.category_name}</p>
                      </div>
                      <span className="text-xs text-white/50">#{service.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-2 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
              <p className="text-sm text-white/60">Observações</p>
              <p className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
                {detail.observations && detail.observations.trim().length > 0
                  ? detail.observations
                  : "Nenhuma observação registrada."}
              </p>
            </section>

            <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 text-sm text-white/70">
              <p>
                Criado em: <span className="font-semibold text-white">{createdAtLabel}</span>
              </p>
              <p className="mt-1">
                Atualizado em: <span className="font-semibold text-white">{updatedAtLabel}</span>
              </p>
            </section>
          </>
        ) : null}
      </div>
    );
  };

  const renderAppointmentsContent = () => {
    if (isCreatingAppointment) {
      return renderCreateAppointmentScreen();
    }
    if (selectedAppointmentId) {
      return renderAppointmentDetailScreen();
    }
    const summaryValue = formatCurrency(appointmentsSummary.completed_total_price ?? "0");
    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Agenda</p>
            <p className="text-3xl font-semibold">Seus agendamentos</p>
            <p className="text-xs text-white/60">{appointmentsCount} encontrado(s)</p>
          </div>
          <button
            type="button"
            onClick={handleOpenAppointmentsFilter}
            className="rounded-2xl border border-white/10 p-2 text-white/80"
          >
            <Filter className="h-5 w-5" />
          </button>
        </header>

        <section className="grid gap-4 min-[400px]:grid-cols-2">
          <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-4">
            <p className="text-sm text-white/60">Faturamento do período</p>
            <p className="mt-2 text-3xl font-semibold">{summaryValue}</p>
          </article>
          <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-4">
            <p className="text-sm text-white/60">Serviços concluídos</p>
            <p className="mt-2 text-3xl font-semibold">
              {appointmentsSummary.completed_total_count ?? 0}
            </p>
          </article>
        </section>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {appointmentsDateOptions.map((option) => (
            <button
              type="button"
              key={option.key}
              onClick={() => handleSelectDate(option.date)}
              className={`rounded-full px-5 py-2 text-sm font-medium ${
                formatDateParam(selectedDate) === option.key
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {appointmentsError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {appointmentsError}
          </div>
        ) : null}

        {appointmentsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>
        ) : appointments.length === 0 ? (
          <p className="rounded-3xl border border-white/5 bg-[#0b0b0b] px-4 py-6 text-center text-sm text-white/60">
            Nenhum agendamento para o período selecionado.
          </p>
        ) : (
          <section className="space-y-3">
            {appointments.map((appointment) => {
              const time = new Date(appointment.date_time).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const mainService = appointment.services[0];
              const priceClass = priceStatusColor(appointment.status);
              return (
                <article
                  key={appointment.id}
                  onClick={() => handleOpenAppointmentDetail(appointment.id)}
                  className="flex cursor-pointer items-center justify-between rounded-3xl border border-white/5 bg-[#0b0b0b] px-4 py-3 transition hover:border-white/20"
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <p className="text-xs text-white/60">{time}</p>
                    <p className="mt-1 text-base font-semibold">
                      {appointment.client_name ?? "Cliente"} - {appointment.professional_name ?? "Profissional"}
                    </p>
                    <p className="text-xs text-white/60">
                      {mainService?.name || "Serviço"} • {appointment.payment_type || "Sem pagamento"}
                    </p>
                  </div>
                  <p className={`text-lg font-semibold ${priceClass}`}>
                    {formatCurrency(appointment.price_paid)}
                  </p>
                </article>
              );
            })}
          </section>
        )}

        <button
          type="button"
          onClick={handleStartCreateAppointment}
          className="fixed bottom-24 left-1/2 w-56 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-card"
        >
          + Novo agendamento
        </button>
      </div>
    );
  };

  const renderServiceDetailScreen = () => {
    if (serviceDetailLoading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-white/70">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="mt-3 text-sm">Carregando serviço...</p>
        </div>
      );
    }

    if (serviceDetailError) {
      return (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {serviceDetailError}
        </div>
      );
    }

    if (!serviceDetail) {
      return null;
    }

    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={handleBackToServiceList}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Serviços</p>
            <p className="text-2xl font-semibold">{serviceDetail.name}</p>
          </div>
          {renderProfileMenu()}
        </header>

        {formError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {formError}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Informações do serviço</p>
              <p className="text-xs text-white/60">
                {canEditService ? "Modo de edição habilitado" : "Somente leitura"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleServiceEdit}
              className="rounded-2xl border border-white/10 p-2 text-white/80"
            >
              <PenSquare className="h-4 w-4" />
            </button>
          </div>

          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <label className="text-sm text-white/70">
              Nome
              <input
                type="text"
                {...registerEditService("name")}
                disabled={!canEditService}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editServiceErrors.name ? "border-red-500/60" : "border-white/10"
                } ${!canEditService ? "opacity-60" : ""}`}
              />
              {editServiceErrors.name ? (
                <p className="mt-1 text-xs text-red-400">{editServiceErrors.name.message}</p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Preço
              <input
                type="text"
                {...registerEditService("price")}
                disabled={!canEditService}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editServiceErrors.price ? "border-red-500/60" : "border-white/10"
                } ${!canEditService ? "opacity-60" : ""}`}
              />
              {editServiceErrors.price ? (
                <p className="mt-1 text-xs text-red-400">{editServiceErrors.price.message}</p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Categoria
              <select
                {...registerEditService("category")}
                disabled={!canEditService}
                className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editServiceErrors.category ? "border-red-500/60" : "border-white/10"
                } ${!canEditService ? "opacity-60" : ""}`}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {serviceCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {editServiceErrors.category ? (
                <p className="mt-1 text-xs text-red-400">{editServiceErrors.category.message}</p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Duração
              <input
                type="text"
                {...registerEditService("duration")}
                disabled={!canEditService}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editServiceErrors.duration ? "border-red-500/60" : "border-white/10"
                } ${!canEditService ? "opacity-60" : ""}`}
              />
              {editServiceErrors.duration ? (
                <p className="mt-1 text-xs text-red-400">{editServiceErrors.duration.message}</p>
              ) : null}
            </label>
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                {...registerEditService("isActive")}
                disabled={!canEditService}
                className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
              />
              Serviço ativo
            </label>
          </form>

          {canEditService ? (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleUpdateService}
                disabled={isUpdatingService}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdatingService ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar serviço"
                )}
              </button>
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Produtos utilizados</p>
              <p className="text-xs text-white/60">
                Controle os insumos necessários para o serviço.
              </p>
            </div>
            {canEditService ? (
              <button
                type="button"
                onClick={() => handleOpenProductModal("service-detail")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            ) : null}
          </div>

          {serviceDetail.product_usages.length === 0 ? (
            <p className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60">
              Nenhum produto associado.
            </p>
          ) : (
            <ul className="space-y-3">
              {serviceDetail.product_usages.map((usage) => (
                <li
                  key={usage.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{usage.product_name}</p>
                    <p className="text-xs text-white/60">
                      Quantidade: {usage.quantity_used}
                    </p>
                  </div>
                  {canEditService ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteProductUsage(usage.id)}
                      disabled={productUsageDeletingId === usage.id}
                      className="text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className={`h-4 w-4 ${productUsageDeletingId === usage.id ? "animate-pulse" : ""}`} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  };

  const renderServiceCard = (service: ServiceItem) => {
    const Icon = getServiceIcon(service.category_name || "");
    return (
      <button
        key={service.id}
        type="button"
        onClick={() => handleOpenServiceDetail(service.id)}
        className="flex w-full items-center justify-between rounded-3xl border border-white/5 bg-[#0b0b0b] px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-semibold">{service.name}</p>
            <p className="text-xs text-white/60">
              {formatDurationLabel(service.duration)} • {service.category_name}
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold">{formatCurrency(service.price)}</p>
      </button>
    );
  };

  const renderCreateServiceScreen = () => (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={handleCancelCreateService}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-white/60">Serviços</p>
          <p className="text-2xl font-semibold">Novo serviço</p>
          <p className="text-xs text-white/50">Cadastre um serviço para o catálogo</p>
        </div>
      </header>

      <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <form onSubmit={handleCreateService} className="space-y-4">
          <label className="text-sm text-white/70">
            Nome do serviço
            <input
              type="text"
              {...registerCreateService("name")}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                createServiceErrors.name ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {createServiceErrors.name ? (
              <p className="mt-1 text-xs text-red-400">
                {createServiceErrors.name.message}
              </p>
            ) : null}
          </label>
          <label className="text-sm text-white/70">
            Preço
            <input
              type="text"
              inputMode="decimal"
              placeholder="120.00"
              {...registerCreateService("price")}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                createServiceErrors.price ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {createServiceErrors.price ? (
              <p className="mt-1 text-xs text-red-400">
                {createServiceErrors.price.message}
              </p>
            ) : null}
          </label>
          <label className="text-sm text-white/70">
            Categoria
            <select
              {...registerCreateService("category")}
              className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                createServiceErrors.category ? "border-red-500/60" : "border-white/10"
              }`}
            >
              <option value="" disabled>
                Selecione
              </option>
              {serviceCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {createServiceErrors.category ? (
              <p className="mt-1 text-xs text-red-400">
                {createServiceErrors.category.message}
              </p>
            ) : null}
          </label>
          <label className="text-sm text-white/70">
            Duração (ex: 01:30:00)
            <input
              type="text"
              placeholder="01:30:00"
              {...registerCreateService("duration")}
              className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                createServiceErrors.duration ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {createServiceErrors.duration ? (
              <p className="mt-1 text-xs text-red-400">
                {createServiceErrors.duration.message}
              </p>
            ) : null}
          </label>
          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              {...registerCreateService("isActive")}
              className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
            />
            Serviço ativo
          </label>

          <fieldset className="space-y-3 rounded-2xl border border-white/10 p-4">
            <legend className="px-2 text-xs uppercase tracking-wide text-white/50">
              Produtos necessários
            </legend>
            <button
              type="button"
              onClick={() => handleOpenProductModal("create")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80"
            >
              <Plus className="h-4 w-4" />
              Adicionar produto
            </button>
            {productUsageWatch.length === 0 ? (
              <p className="text-xs text-white/50">Nenhum produto adicionado.</p>
            ) : (
              <ul className="space-y-2 text-sm text-white/80">
                {productUsageWatch.map((item, index) => (
                  <li
                    key={`${item.product}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold">{item.product_name ?? `Produto #${item.product}`}</p>
                      <p className="text-xs text-white/60">
                        Quantidade: {item.quantity_used}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewProductUsage(index)}
                      className="text-xs text-red-300"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          {formError ? (
            <p className="text-sm text-red-300">{formError}</p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingService}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingService ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar serviço"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );

  const renderServicesContent = () => {
    if (isCreatingService) {
      return renderCreateServiceScreen();
    }
    if (selectedServiceId) {
      return renderServiceDetailScreen();
    }

    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Serviços</p>
            <p className="text-2xl font-semibold">Gerencie seu catálogo</p>
          </div>
          <button
            type="button"
            onClick={handleStartCreateService}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </header>

        <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Crie experiências memoráveis</h2>
              <p className="text-sm text-white/60">
                Organize seus serviços, categorias e destaque o portfólio da barbearia.
              </p>
            </div>
            <div className="relative h-24 w-24 flex-shrink-0">
              <Image
                src="/relogio_urus.png"
                alt="Relógio Urus"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <form onSubmit={handleServiceSearchSubmit} className="relative" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={servicesSearchInput}
            onChange={(event) => setServicesSearchInput(event.target.value)}
            placeholder="Buscar serviço, duração..."
            className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none transition focus:border-white/40"
          />
          {servicesSearchTerm ? (
            <button
              type="button"
              onClick={() => {
                setServicesSearchInput("");
                setServicesSearchTerm("");
              }}
              className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-white/60"
            >
              Limpar
            </button>
          ) : null}
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
          >
            Buscar
          </button>
        </form>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <button
            type="button"
            onClick={() => handleServiceCategorySelect(null)}
            className={`rounded-full px-5 py-2 text-sm font-medium ${
              selectedServiceCategory === null
                ? "bg-white text-black"
                : "bg-white/10 text-white/70"
            }`}
          >
            Todos
          </button>
          {serviceCategories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => handleServiceCategorySelect(category.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium ${
                selectedServiceCategory === category.id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {serviceCategoriesError ? (
          <p className="text-xs text-red-300">{serviceCategoriesError}</p>
        ) : null}

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Todos os serviços</h3>
            <span className="text-xs text-white/60">{servicesCount} itens</span>
          </div>
          {servicesFetchError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {servicesFetchError}
            </div>
          ) : null}
          {servicesLoadingList ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-white/70" />
            </div>
          ) : servicesList.length === 0 ? (
            <p className="rounded-2xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">
              Nenhum serviço encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {servicesList.map((service) => renderServiceCard(service))}
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderUserDetailScreen = () => {
    if (userDetailLoading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-white/70">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="mt-3 text-sm">Carregando usuário...</p>
        </div>
      );
    }

    if (userDetailError) {
      return (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {userDetailError}
        </div>
      );
    }

    if (!userDetail) {
      return null;
    }

    const isProfessional = userDetail.role === "professional";
    const profileExists = Boolean(userDetail.professional_profile);

    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={handleBackToUserList}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-white/60">Usuários</p>
            <p className="text-2xl font-semibold">
              {userDetail.first_name} {userDetail.last_name}
            </p>
          </div>
          {renderProfileMenu()}
        </header>

        {feedbackMessage ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedbackMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : "border-red-500/30 bg-red-500/10 text-red-100"
            }`}
          >
            {feedbackMessage.message}
          </div>
        ) : null}

        {formError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {formError}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {userDetail.profile_pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userDetail.profile_pic}
                  alt={`${userDetail.first_name} ${userDetail.last_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-7 w-7 text-white/70" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {userDetail.first_name} {userDetail.last_name}
              </p>
              <p className="text-sm text-white/60">{userDetail.role_display}</p>
              <p className="text-xs text-white/40">{userDetail.email}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                {userDetail.profile_pic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userDetail.profile_pic}
                    alt={`${userDetail.first_name} ${userDetail.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8 text-white/70" />
                )}
              </div>
              <div className="flex flex-1 justify-between">
                <div>
                  <p className="text-lg font-semibold">Informações do usuário</p>
                  <p className="text-xs text-white/60">
                    {canEditUser ? "Modo de edição habilitado" : "Visualização"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEditUser}
                  className="rounded-2xl  p-2 text-white/80 transition hover:border-white/40"
                  aria-label="Editar usuário"
                >
                  <PenSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <label className="text-sm text-white/70">
              Primeiro nome
              <input
                type="text"
                {...registerEditUser("firstName")}
                disabled={!canEditUser}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editUserErrors.firstName ? "border-red-500/60" : "border-white/10"
                } ${!canEditUser ? "opacity-60" : ""}`}
              />
              {editUserErrors.firstName ? (
                <p className="mt-1 text-xs text-red-400">
                  {editUserErrors.firstName.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Sobrenome
              <input
                type="text"
                {...registerEditUser("lastName")}
                disabled={!canEditUser}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editUserErrors.lastName ? "border-red-500/60" : "border-white/10"
                } ${!canEditUser ? "opacity-60" : ""}`}
              />
              {editUserErrors.lastName ? (
                <p className="mt-1 text-xs text-red-400">
                  {editUserErrors.lastName.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              E-mail
              <input
                type="email"
                {...registerEditUser("email")}
                disabled={!canEditUser}
                className={`mt-1 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editUserErrors.email ? "border-red-500/60" : "border-white/10"
                } ${!canEditUser ? "opacity-60" : ""}`}
              />
              {editUserErrors.email ? (
                <p className="mt-1 text-xs text-red-400">
                  {editUserErrors.email.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Telefone
              <input
                type="tel"
                {...registerEditUser("phone")}
                disabled={!canEditUser}
                className={`mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  !canEditUser ? "opacity-60" : ""
                }`}
              />
            </label>
            <label className="text-sm text-white/70">
              CPF
              <input
                type="text"
                {...registerEditUser("cpf")}
                disabled={!canEditUser}
                className={`mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  !canEditUser ? "opacity-60" : ""
                }`}
              />
            </label>
            <label className="text-sm text-white/70">
              Função
              <select
                {...registerEditUser("role")}
                disabled={!canEditUser}
                className={`mt-1 w-full rounded-2xl border bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40 ${
                  editUserErrors.role ? "border-red-500/60" : "border-white/10"
                } ${!canEditUser ? "opacity-60" : ""}`}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {editUserErrors.role ? (
                <p className="mt-1 text-xs text-red-400">
                  {editUserErrors.role.message}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-white/70">
              Data de nascimento
              <div
                className={`mt-1 flex items-center rounded-2xl border bg-transparent px-3 focus-within:border-white/40 ${
                  editUserErrors.dateOfBirth ? "border-red-500/60" : "border-white/10"
                } ${!canEditUser ? "opacity-60" : ""}`}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/aaaa"
                  value={editDateOfBirthValue}
                  onChange={handleEditDateInputChange}
                  disabled={!canEditUser}
                  className="w-full bg-transparent px-1 py-3 text-sm outline-none"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={handleOpenEditDatePicker}
                  disabled={!canEditUser}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                  aria-label="Abrir calendário"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <input
                  ref={editDatePickerRef}
                  type="date"
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handleEditDatePickerChange}
                />
              </div>
              {editUserErrors.dateOfBirth ? (
                <p className="mt-1 text-xs text-red-400">
                  {editUserErrors.dateOfBirth.message}
                </p>
              ) : null}
            </label>
              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  {...registerEditUser("isActive")}
                  disabled={!canEditUser}
                  className="h-4 w-4 rounded border border-white/20 bg-transparent text-black"
                />
                Usuário ativo
              </label>
              <label className="text-sm text-white/70 sm:col-span-2">
                Foto de perfil
                <input
                  type="file"
                  accept="image/*"
                  {...registerEditUser("profilePic")}
                  disabled={!canEditUser}
                  className={`mt-1 w-full rounded-2xl border border-dashed border-white/15 bg-transparent px-4 py-3 text-sm text-white/70 outline-none file:mr-4 file:rounded-2xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black ${
                    !canEditUser ? "opacity-60" : ""
                  }`}
                />
              </label>
          </form>
          {canEditUser ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleUpdateUser}
                disabled={isUpdatingUser}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdatingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar usuário"
                )}
              </button>
            </div>
          ) : null}
        </section>

        {userDetail.role === "client" ? (
          <section className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-1 shadow-card">
            <button
              type="button"
              onClick={handleOpenClientHistory}
              className="flex w-full items-center overflow-hidden rounded-2xl bg-white text-left transition hover:shadow-lg"
            >
              <div className="flex flex-1 flex-col gap-2 px-4 py-4 text-black">
                <p className="text-lg font-semibold">Descubra os atendimentos de {userDetail.first_name}</p>
                <span className="inline-flex w-max items-center gap-2 rounded-full bg-black px-4 py-1 text-xs font-medium text-white">
                  Abrir histórico
                </span>
              </div>
              <div className="relative h-32 w-32 flex-shrink-0">
                <Image
                  src="/barbeiro_cortando.png"
                  alt="Barbeiro cortando"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            </button>
          </section>
        ) : null}

        {isProfessional ? (
          <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Perfil profissional</h2>
              {profileExists || showProfileForm ? (
                <button
                  type="button"
                  onClick={handleSaveProfessionalProfile}
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar perfil"
                  )}
                </button>
              ) : null}
            </div>

            {profileExists || showProfileForm ? (
              <form
                className="space-y-4"
                onSubmit={(event) => event.preventDefault()}
              >
                <fieldset className="space-y-4 rounded-2xl border border-white/5 p-4">
                  <legend className="px-2 text-xs uppercase tracking-wide text-white/50">
                    Dados do profissional
                  </legend>
                  <label className="text-sm text-white/70">
                    Tipo profissional
                    <select
                      {...registerProfile("professionalType")}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {professionalTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {profileErrors.professionalType ? (
                      <p className="mt-1 text-xs text-red-400">
                        {profileErrors.professionalType.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-white/70">
                    CNPJ
                    <input
                      type="text"
                      {...registerProfile("cnpj")}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    />
                    {profileErrors.cnpj ? (
                      <p className="mt-1 text-xs text-red-400">
                        {profileErrors.cnpj.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-white/70">
                    Comissão (%)
                    <input
                      type="text"
                      inputMode="decimal"
                      {...registerProfile("commission")}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    />
                    {profileErrors.commission ? (
                      <p className="mt-1 text-xs text-red-400">
                        {profileErrors.commission.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="text-sm text-white/70">
                    Bio
                    <textarea
                      {...registerProfile("bio")}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                      rows={3}
                    />
                  </label>
                  <div>
                    <p className="text-sm text-white/70">Serviços</p>
                    <div className="mt-2" ref={servicesDropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setShowServicesDropdown((previous) => !previous)
                        }
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white/80"
                      >
                        {selectedServiceNames.length > 0
                          ? `${selectedServiceNames.length} serviço(s) selecionado(s)`
                          : "Selecione serviços"}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {showServicesDropdown ? (
                        <div className="mt-2 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-[#111] p-3 text-sm">
                          {servicesLoading ? (
                            <p className="text-white/60">Carregando...</p>
                          ) : servicesError ? (
                            <p className="text-red-300/80">{servicesError}</p>
                          ) : (
                            servicesOptions.map((service) => {
                              const selected =
                                selectedProfessionalServices.includes(service.id);
                              return (
                                <label
                                  key={service.id}
                                  className="flex items-center gap-3 rounded-xl px-2 py-1 text-white/80 hover:bg-white/5"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() =>
                                      handleToggleProfessionalService(service.id)
                                    }
                                    className="h-4 w-4 rounded border border-white/30 bg-transparent"
                                  />
                                  {service.name}
                                </label>
                              );
                            })
                          )}
                        </div>
                      ) : null}
                      {selectedServiceNames.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedServiceNames.map((name) => (
                            <span
                              key={name}
                              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {profileErrors.services ? (
                        <p className="mt-1 text-xs text-red-400">
                          {profileErrors.services.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </fieldset>
              </form>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                <p>Este profissional ainda não possui um perfil configurado.</p>
                <button
                  type="button"
                  onClick={() => {
                    resetProfileForm(professionalProfileDefaultValues);
                    setShowProfileForm(true);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
                >
                  Criar perfil do profissional
                </button>
              </div>
            )}
          </section>
        ) : null}
      </div>
    );
  };

  const renderUsersContent = () => {
    if (isCreatingUser) {
      return renderCreateUserScreen();
    }
    if (selectedUserId) {
      if (showClientHistory) {
        return renderClientHistoryScreen();
      }
      return renderUserDetailScreen();
    }

    return (
      <>
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 hover:text-white"
          onClick={() => setActiveTab("home")}
          aria-label="Voltar para Home"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-center text-sm text-white/60">Painel</p>
          <p className="text-center text-2xl font-semibold">Usuários</p>
        </div>
        {renderProfileMenu()}
      </header>

      {feedbackMessage ? (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            feedbackMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              : "border-red-500/30 bg-red-500/10 text-red-100"
          }`}
        >
          {feedbackMessage.message}
        </div>
      ) : null}

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
          <p className="text-sm text-white/60">Total de usuários</p>
          <p className="mt-2 text-3xl font-semibold">{totalUsers}</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Pesquisar usuários"
            className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-32 text-sm outline-none transition focus:border-white/40"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-24 top-1/2 -translate-y-1/2 text-xs text-white/60 hover:text-white"
            >
              Limpar
            </button>
          ) : null}
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <div className="relative" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setShowRoleDropdown((prev) => !prev)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                roleFilter
                  ? "border-white bg-white text-black"
                  : "border-white/10 text-white"
              }`}
            >
              <Filter className="h-4 w-4" />
              {roleFilter ? selectedRoleLabel : "Filtros"}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showRoleDropdown ? (
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-2xl border border-white/10 bg-[#111] p-2 shadow-card">
                <button
                  type="button"
                  onClick={() => handleRoleSelect(null)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
                >
                  Todos
                  {!roleFilter ? (
                    <span className="text-xs text-emerald-300">Ativo</span>
                  ) : null}
                </button>
                {roleOptions.length === 0 && !roleOptionsError ? (
                  <p className="px-3 py-2 text-xs text-white/60">Carregando...</p>
                ) : null}
                {roleOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => handleRoleSelect(option.value)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
                  >
                    {option.label}
                    {roleFilter === option.value ? (
                      <span className="text-xs text-emerald-300">Ativo</span>
                    ) : null}
                  </button>
                ))}
                {roleOptionsError ? (
                  <p className="px-3 py-2 text-xs text-red-300/80">
                    {roleOptionsError}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleStartCreateUser}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            Novo usuário
          </button>

          <label className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs text-white/70">
            Mostrar
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-transparent text-sm text-white focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            itens
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold">Lista de usuários</p>
          <span className="text-xs text-white/60">
            Página {currentPage} de {totalPages}
          </span>
        </div>

        {usersError ? (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {usersError}
          </div>
        ) : null}

        {usersLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>
        ) : null}

        {!usersLoading && usersList.length === 0 ? (
          <p className="rounded-2xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">
            Nenhum usuário encontrado.
          </p>
        ) : null}

        <div className="space-y-3">
          {usersList.map((user) => {
            const fullName = `${user.first_name} ${user.last_name}`.trim();
            const roleLabel = roleLabelMap[user.role] ?? user.role;
            const professionalType =
              user.role === "professional"
                ? user.professional_profile?.professional_type
                : null;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleOpenUserDetail(user.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-white/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                    {user.profile_pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profile_pic}
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-6 w-6 text-white/70" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold">{fullName}</p>
                    <p className="text-sm text-white/60">
                      {roleLabel}
                      {professionalType ? ` • ${professionalType}` : null}
                    </p>
                    <p className="text-xs text-white/40">{user.email}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </button>
            );
          })}
        </div>
      </section>

        {usersList.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/60">
              Mostrando {usersList.length} de {totalUsers} usuário
              {totalUsers === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePagination("previous")}
                disabled={!usersData?.previous || usersLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/30"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => handlePagination("next")}
                disabled={!usersData?.next || usersLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/30"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const renderFinancesContent = () => {
    const monthLabel = getMonthLabel(financeMonth);
    const appointmentPaymentData =
      financeSummary?.appointments_by_payment_type?.map((entry) => ({
        name: getPaymentTypeLabel(entry.payment_type as PaymentType),
        raw: entry.payment_type,
        value: entry.total,
      })) ?? [];
    const sellPaymentData =
      financeSummary?.sell_by_payment_type?.map((entry) => ({
        name: getSellPaymentLabel(entry.transaction_payment),
        raw: entry.transaction_payment,
        value: entry.total,
      })) ?? [];
  const cards = [
    {
      label: "Receitas",
      description: "Entradas do mês",
      value: formatCurrency(financeSummary?.revenue ?? "0"),
      icon: Coins,
      iconClass: "text-emerald-400",
    },
    {
      label: "Despesas",
      description: "Saídas do mês",
      value: formatCurrency(financeSummary?.expenses ?? "0"),
      icon: Wallet,
      iconClass: "text-red-400",
    },
    {
      label: "Serviços",
      description: "Total executados",
      value: financeSummary?.appointments_count ?? 0,
      icon: Scissors,
      iconClass: "text-white",
    },
    {
      label: "Vendas",
      description: "Produtos vendidos",
      value: financeSummary?.sell_transactions_count ?? 0,
      icon: DollarSign,
      iconClass: "text-white",
    },
  ];

    const renderPieCard = (
      title: string,
      subtitle: string,
      data: { name: string; raw: string; value: number }[],
    ) => {
      if (data.length === 0) {
        return (
          <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 text-sm text-white/60">
            <p className="text-base font-semibold text-white">{title}</p>
            <p>{subtitle}</p>
            <p className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-xs">
              Nenhum dado disponível para o período.
            </p>
          </article>
        );
      }
      return (
        <article className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60">{subtitle}</p>
              <p className="text-lg font-semibold text-white">{title}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={4}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${entry.raw}`} fill={pieChartColors[index % pieChartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Number(value).toFixed(2))}
                    contentStyle={{
                      backgroundColor: "#111",
                      borderRadius: 12,
                      border: "1px solid #333",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 text-sm text-white/80">
              {data.map((item, index) => (
                <div
                  key={item.raw}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pieChartColors[index % pieChartColors.length] }}
                    />
                    <p>{item.name}</p>
                  </div>
                  <span className="font-semibold text-white">
                    {formatCurrency(item.value.toFixed(2))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      );
    };

    return (
      <div className="flex flex-col gap-5 pb-24">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Financeiro</p>
            <p className="text-2xl font-semibold">{monthLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleOpenFinanceMonthModal}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 p-2 text-white/80"
            aria-label="Selecionar mês"
          >
            <Calendar className="h-5 w-5" />
          </button>
        </header>

        {financeSummaryError ? (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {financeSummaryError}
          </p>
        ) : null}

        {financeSummaryLoading && !financeSummary ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-[#0b0b0b] p-6 text-white/70">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="mt-2 text-sm">Carregando indicadores...</p>
          </div>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2">
              {cards.map((card, index) => {
                const Icon = card.icon;
                const isFirstRow = index < 2;
                return (
                  <article
                    key={card.label}
                    className="flex items-center gap-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${card.iconClass}`}
                    >
                      <Icon className={`h-5 w-5 ${card.iconClass}`} />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">{card.description}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{card.label}</p>
                      <p
                        className={`mt-1 text-2xl font-semibold ${
                          isFirstRow && card.label === "Receitas"
                            ? "text-emerald-300"
                            : isFirstRow && card.label === "Despesas"
                              ? "text-red-300"
                              : "text-white"
                        }`}
                      >
                        {typeof card.value === "number" ? card.value : card.value}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {renderPieCard("Pagamentos dos serviços", "Distribuição por forma", appointmentPaymentData)}
                {renderPieCard("Pagamentos das vendas", "Distribuição por forma", sellPaymentData)}
              </div>
            </section>
          </>
        )}

        <fieldset className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Repasses</legend>
          {repassesLoading ? (
            <div className="flex items-center justify-center py-6 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : repassesError ? (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {repassesError}
            </p>
          ) : repassesList.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
              Nenhum repasse encontrado para o período.
            </p>
          ) : (
            <ul className="space-y-3">
              {repassesList.map((repasse) => {
                const serviceValue = parseCurrencyInput(repasse.value_service ?? "0");
                const productValue = parseCurrencyInput(repasse.value_product ?? "0");
                const totalValue = serviceValue + productValue;
                return (
                  <li
                    key={repasse.id}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">{repasse.professional.name}</p>
                        <p className="text-xs text-white/60">
                          Serviços: {formatCurrency(serviceValue.toFixed(2))} • Produtos:{" "}
                          {formatCurrency(productValue.toFixed(2))}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(totalValue.toFixed(2))}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        {repasse.is_paid ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                        {repasse.is_paid ? "Pago" : "Pendente"}
                      </span>
                      {repasse.invoice ? (
                        <a
                          href={repasse.invoice}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 underline-offset-2 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          Ver NF
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>

        <fieldset className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <legend className="px-2 text-xs uppercase tracking-wide text-white/50">Contas</legend>
          {billsLoading ? (
            <div className="flex items-center justify-center py-6 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : billsError ? (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {billsError}
            </p>
          ) : billsList.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-white/60">
              Nenhuma conta cadastrada para o período.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {(showAllBills ? billsList : billsList.slice(0, 6)).map((bill) => {
                  const dueDate = bill.date_of_payment
                    ? new Date(bill.date_of_payment).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "--/--/----";
                  return (
                    <li
                      key={bill.id}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-white">{bill.name}</p>
                          <p className="text-xs text-white/60">{bill.bill_type}</p>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(bill.value ?? "0")}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                        <span className="inline-flex items-center gap-2 font-semibold">
                          {bill.is_paid ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <X className="h-4 w-4 text-red-400" />
                          )}
                          {bill.is_paid ? "Pago" : "Pendente"}
                        </span>
                        <span>Vencimento: {dueDate}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {billsList.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setShowAllBills((previous) => !previous)}
                  className="w-full rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/30"
                >
                  {showAllBills ? "Ver menos" : "Ver todas"}
                </button>
              ) : null}
            </>
          )}
        </fieldset>
      </div>
    );
  };

  const renderContentByTab = () => {
    switch (activeTab) {
      case "home":
        return renderHomeContent();
      case "users":
        return renderUsersContent();
      case "agenda":
        return renderAppointmentsContent();
      case "services":
        return renderServicesContent();
      case "products":
        return renderProductsContent();
      case "finances":
        return renderFinancesContent();
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-10">
        {renderContentByTab()}
      </div>

      <nav className="fixed bottom-4 left-1/2 w-full max-w-md -translate-x-1/2 px-4">
        <div className="grid grid-cols-6 gap-2 rounded-3xl border border-white/10 bg-[#0b0b0b]/80 p-2 backdrop-blur">
          {bottomNavItems.map((item) => {
            const isActive = item.key === activeTab;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                  isActive ? "bg-white text-black shadow-inner" : "text-white/70"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                <span className="mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {productsModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Produtos</p>
                <h2 className="text-xl font-semibold">Adicionar produto</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseProductModal}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={productSearchInput}
                onChange={(event) => setProductSearchInput(event.target.value)}
                placeholder="Buscar produtos"
                className="h-11 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/40"
              />
            </div>

            <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl border border-white/10">
              {productsLoading ? (
                <div className="flex items-center justify-center py-6 text-white/70">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : productsError ? (
                <p className="px-4 py-3 text-xs text-red-300">{productsError}</p>
              ) : productsList.length === 0 ? (
                <p className="px-4 py-3 text-sm text-white/60">
                  Nenhum produto disponível.
                </p>
              ) : (
                <ul className="divide-y divide-white/5 text-sm">
                  {productsList.map((product) => (
                    <li key={product.id}>
                      <label className="flex items-center gap-3 px-4 py-3">
                        <input
                          type="radio"
                          name="selectedProduct"
                          checked={selectedProductCandidate === product.id}
                          onChange={() => setSelectedProductCandidate(product.id)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-white/60">ID #{product.id}</p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label className="mt-4 block text-sm text-white/70">
              Quantidade utilizada
              <input
                type="number"
                min={1}
                value={productQuantityInput}
                onChange={(event) => setProductQuantityInput(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
              />
            </label>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseProductModal}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmProductSelection}
                disabled={productModalContext === "service-detail" && isAddingProductUsage}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {productModalContext === "service-detail" && isAddingProductUsage
                  ? "Adicionando..."
                  : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showClientPickerModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Clientes</p>
                <h2 className="text-xl font-semibold">Selecionar cliente</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowClientPickerModal(false)}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleClientPickerSearchSubmit} className="relative" role="search">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={clientSearchInput}
                onChange={(event) => setClientSearchInput(event.target.value)}
                placeholder="Buscar cliente por nome"
                className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
              >
                Buscar
              </button>
            </form>
            <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
              {clientPickerLoading ? (
                <div className="flex items-center justify-center py-6 text-white/70">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : clientPickerError ? (
                <p className="px-4 py-3 text-sm text-red-300">{clientPickerError}</p>
              ) : clientPickerResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-white/60">Nenhum cliente encontrado.</p>
              ) : (
                <ul className="divide-y divide-white/5 text-sm text-white/80">
                  {clientPickerResults.map((client) => {
                    const isSelected = client.id === selectedClient?.id;
                    const name =
                      [client.first_name, client.last_name].filter(Boolean).join(" ") ||
                      client.email;
                    return (
                      <li key={client.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
                        >
                          <div>
                            <p className="font-semibold">{name}</p>
                            <p className="text-xs text-white/60">{client.email}</p>
                          </div>
                          {isSelected ? (
                            <Check className="h-4 w-4 text-emerald-300" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showServicesPickerModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Serviços</p>
                <h2 className="text-xl font-semibold">Escolha os serviços</h2>
              </div>
              <button
                type="button"
                onClick={handleCancelServicesPicker}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleServicePickerSearchSubmit} className="relative" role="search">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={servicesPickerSearchInput}
                onChange={(event) => setServicesPickerSearchInput(event.target.value)}
                placeholder="Buscar serviço por nome"
                className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
              >
                Buscar
              </button>
            </form>
            <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
              {servicesPickerLoading ? (
                <div className="flex items-center justify-center py-6 text-white/70">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : servicesPickerError ? (
                <p className="px-4 py-3 text-sm text-red-300">{servicesPickerError}</p>
              ) : servicesPickerResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-white/60">Nenhum serviço encontrado.</p>
              ) : (
                <ul className="divide-y divide-white/5 text-sm text-white/80">
                  {servicesPickerResults.map((service) => {
                    const isSelected = servicesPickerTempSelection.some(
                      (item) => item.id === service.id,
                    );
                    return (
                      <li key={service.id}>
                        <label className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5">
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-xs text-white/60">
                              {formatCurrency(service.price)}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleServiceInModal(service)}
                            className="h-4 w-4 rounded border-white/20 bg-transparent text-black"
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCancelServicesPicker}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmServicesPicker}
                className="flex-1 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Adicionar serviços
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showProfessionalPickerModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Profissionais</p>
                <h2 className="text-xl font-semibold">Selecionar profissional</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseProfessionalPicker}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={handleProfessionalPickerSearchSubmit}
              className="relative"
              role="search"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={professionalSearchInput}
                onChange={(event) => setProfessionalSearchInput(event.target.value)}
                placeholder="Buscar profissional"
                className="h-12 w-full rounded-2xl border border-white/10 bg-transparent pl-11 pr-24 text-sm outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-black"
              >
                Buscar
              </button>
            </form>
            <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
              {professionalPickerLoading ? (
                <div className="flex items-center justify-center py-6 text-white/70">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : professionalPickerError ? (
                <p className="px-4 py-3 text-sm text-red-300">{professionalPickerError}</p>
              ) : professionalPickerResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-white/60">Nenhum profissional encontrado.</p>
              ) : (
                <ul className="divide-y divide-white/5 text-sm text-white/80">
                  {professionalPickerResults.map((professional) => {
                    const isSelected =
                      currentProfessionalPickerSlot?.professional?.id === professional.id;
                    return (
                      <li key={professional.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectProfessionalForAppointment(professional)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
                        >
                          <span className="font-semibold">{professional.name}</span>
                          {isSelected ? <Check className="h-4 w-4 text-emerald-300" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showPaymentTypeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Pagamento</p>
                <h2 className="text-xl font-semibold">Escolha a forma</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentTypeModal(false)}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {paymentTypeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = option.value === selectedPaymentType;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectPaymentOption(option.value)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive ? "border-white bg-white text-black" : "border-white/10 text-white/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {option.label}
                    </div>
                    {isActive ? <Check className="h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {saleModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Venda</p>
                <h2 className="text-xl font-semibold">Adicionar produto</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseSaleModal}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {saleProductsLoading ? (
                <div className="flex items-center justify-center py-6 text-white/70">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : saleProductsError ? (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {saleProductsError}
                </p>
              ) : saleProductsList.length === 0 ? (
                <p className="text-sm text-white/60">Nenhum produto disponível para venda.</p>
              ) : (
                <ul className="max-h-52 overflow-y-auto rounded-2xl border border-white/10">
                  {saleProductsList.map((product) => (
                    <li key={product.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-white/5">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-white/60">
                            Preço sugerido: {formatCurrency(product.price_to_sell)}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="saleProduct"
                          checked={selectedSaleProductId === product.id}
                          onChange={() => handleSelectSaleProduct(product.id)}
                          className="h-4 w-4 rounded-full border-white/30 bg-transparent text-black"
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {selectedSaleProductId ? (
                <div className="space-y-3 rounded-2xl border border-white/10 p-4 text-sm text-white/80">
                  <label className="block text-white/70">
                    Forma de pagamento
                    <select
                      value={salePaymentSelect}
                      onChange={(event) => setSalePaymentSelect(event.target.value as PaymentType)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
                    >
                      <option value="">Selecione</option>
                      {paymentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-white/70">
                    Quantidade
                    <input
                      type="number"
                      min={1}
                      value={saleQuantityInput}
                      onChange={handleSaleQuantityChange}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    />
                  </label>
                  <label className="block text-white/70">
                    Preço (R$)
                    <input
                      type="text"
                      value={salePriceInput}
                      onChange={handleSalePriceChange}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCloseSaleModal}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddSaleProduct}
                disabled={
                  isAddingSaleProduct ||
                  !selectedSaleProductId ||
                  !salePaymentSelect ||
                  saleProductsLoading
                }
                className="flex-1 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAddingSaleProduct ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adicionando...
                  </span>
                ) : (
                  "Adicionar produto"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {productSaleProductModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Produtos</p>
                <h2 className="text-xl font-semibold">Selecionar para venda</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseProductSaleModal}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {productSaleProductsLoading ? (
              <div className="flex items-center justify-center py-6 text-white/70">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : productSaleProductsError ? (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {productSaleProductsError}
              </p>
            ) : productSaleProducts.length === 0 ? (
              <p className="text-sm text-white/60">Nenhum produto disponível para venda.</p>
            ) : (
              <ul className="max-h-72 overflow-y-auto rounded-2xl border border-white/10 text-sm text-white/80">
                {productSaleProducts.map((product) => (
                  <li key={product.id} className="divide-y divide-white/5">
                    <button
                      type="button"
                      onClick={() => handleSelectProductForSale(product)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5"
                    >
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-white/60">
                          {formatCurrency(product.price_to_sell ?? "0")} • {product.quantity} un
                        </p>
                      </div>
                      <Check
                        className={`h-4 w-4 ${productSaleSelectedProduct?.id === product.id ? "text-emerald-300" : "text-white/30"}`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {feedbackMessage ? (
        <div
          className={`fixed top-6 left-1/2 z-[70] w-[90%] max-w-md -translate-x-1/2 rounded-2xl border px-5 py-3 text-sm shadow-xl ${
            feedbackMessage.type === "success"
              ? "border-emerald-500/40 text-emerald-700"
              : "border-red-500/40 text-red-700"
          } bg-white`}
        >
          {feedbackMessage.message}
        </div>
      ) : null}

      {showSummaryFilters ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Resumo</p>
                <h2 className="text-xl font-semibold">Filtrar período</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseSummaryFilters}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSummaryFilterMode("day")}
                className={`flex-1 rounded-2xl px-3 py-2 ${
                  summaryFilterMode === "day" ? "bg-white text-black" : "bg-white/10 text-white/70"
                }`}
              >
                Por dia
              </button>
              <button
                type="button"
                onClick={() => setSummaryFilterMode("month")}
                className={`flex-1 rounded-2xl px-3 py-2 ${
                  summaryFilterMode === "month" ? "bg-white text-black" : "bg-white/10 text-white/70"
                }`}
              >
                Por mês
              </button>
            </div>

            {summaryFilterMode === "day" ? (
              <label className="block text-sm text-white/70">
                Data (dd/mm/aaaa)
                <input
                  type="text"
                  value={summaryDayInput}
                  onChange={(event) => setSummaryDayInput(formatDisplayDate(event.target.value))}
                  placeholder="dd/mm/aaaa"
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:border-white/40"
                />
              </label>
            ) : (
              <div className="flex gap-3">
                <label className="flex-1 text-sm text-white/70">
                  Ano
                  <select
                    value={summaryMonthYear}
                    onChange={(event) => setSummaryMonthYear(event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050505] px-4 py-3 text-base outline-none focus:border-white/40"
                  >
                    <option value="">Selecione</option>
                    {summaryFilterYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex-1 text-sm text-white/70">
                  Mês
                  <select
                    value={summaryMonthValue}
                    onChange={(event) => setSummaryMonthValue(event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050505] px-4 py-3 text-base outline-none focus:border-white/40"
                  >
                    <option value="">Selecione</option>
                    {summaryFilterMonthOptions.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {summaryFilterError ? (
              <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {summaryFilterError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={handleClearSummaryFilters}
                className="rounded-2xl border border-white/15 px-4 py-2 text-white/80"
              >
                Limpar filtros
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseSummaryFilters}
                  className="rounded-2xl border border-white/15 px-4 py-2 text-white/80"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplySummaryFilters}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showFinanceMonthModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Financeiro</p>
                <h2 className="text-xl font-semibold">Selecionar mês</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseFinanceMonthModal}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              <label className="block">
                Ano
                <select
                  value={financeMonthYearInput}
                  onChange={(event) => setFinanceMonthYearInput(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050505] px-4 py-3 text-base outline-none focus:border-white/40"
                >
                  {summaryFilterYears.map((year) => (
                    <option key={`finance-year-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                Mês
                <select
                  value={financeMonthValueInput}
                  onChange={(event) => setFinanceMonthValueInput(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050505] px-4 py-3 text-base outline-none focus:border-white/40"
                >
                  {summaryFilterMonthOptions.map((month) => (
                    <option key={`finance-month-${month.value}`} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
              {financeMonthError ? (
                <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {financeMonthError}
                </p>
              ) : null}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCloseFinanceMonthModal}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyFinanceMonth}
                className="flex-1 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAppointmentsFilterModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-5 text-white shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Filtros</p>
                <h2 className="text-xl font-semibold">Filtrar agendamentos</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAppointmentsFilterModal(false)}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-white/80">
              <label className="block text-white/70">
                Profissional
                <select
                  value={pendingProfessionalId}
                  onChange={(event) => setPendingProfessionalId(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
                >
                  <option value="">Todos</option>
                  {professionalsList.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
                {professionalsError ? (
                  <p className="mt-1 text-xs text-red-300">{professionalsError}</p>
                ) : null}
              </label>
              <label className="block text-white/70">
                Categoria
                <select
                  value={pendingCategoryId}
                  onChange={(event) => setPendingCategoryId(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm outline-none focus:border-white/40"
                >
                  <option value="">Todas</option>
                  {serviceCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-white/70">
                Serviço (ID)
                <input
                  type="text"
                  value={pendingServiceId}
                  onChange={(event) => setPendingServiceId(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                />
              </label>
              <label className="block text-white/70">
                Data inicial
                <input
                  type="date"
                  value={pendingStartDate}
                  onChange={(event) => setPendingStartDate(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                />
              </label>
              <label className="block text-white/70">
                Data final
                <input
                  type="date"
                  value={pendingEndDate}
                  onChange={(event) => setPendingEndDate(event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-white/40"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearAppointmentsFilter}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
              >
                Limpar
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAppointmentsFilterModal(false)}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyAppointmentsFilter}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
