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
  Coins,
  CreditCard,
  QrCode,
  Scissors,
  Search,
  Sparkles,
  X,
  UserRound,
  Users,
  Wallet,
  Wand2,
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

const statsCards = [
  {
    title: "Faturamento",
    value: "R$ 18.450",
    sub: "Este mês • +12% vs. mês anterior",
  },
  {
    title: "Serviços Realizados",
    value: "236",
    sub: "Este mês • +8% vs. mês anterior",
  },
];

const nextAppointment = {
  time: "14:30",
  service: "Corte Masculino",
  client: "João Silva",
  date: "Hoje, 05 Out 2025",
  professional: "Carlos",
};

const topServices: {
  name: string;
  delta: string;
  total: number;
  icon: LucideIcon;
}[] = [
  {
    name: "Corte Masculino",
    delta: "+15% vs. mês anterior",
    total: 128,
    icon: Scissors,
  },
  {
    name: "Barba",
    delta: "+6% vs. mês anterior",
    total: 74,
    icon: Wand2,
  },
  {
    name: "Pigmentação",
    delta: "-3% vs. mês anterior",
    total: 29,
    icon: Sparkles,
  },
];

const chartData = [
  { label: "Carlos", value: 86 },
  { label: "Marcos", value: 48 },
  { label: "Ana", value: 92 },
  { label: "Luís", value: 40 },
  { label: "Paula", value: 70 },
];

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

const paymentTypeOptions: { value: PaymentType; label: string; icon: LucideIcon }[] = [
  { value: "creditcard", label: "Cartão de crédito", icon: CreditCard },
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
  const datePickerRef = useRef<HTMLInputElement>(null);
  const editDatePickerRef = useRef<HTMLInputElement>(null);
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
  const [selectedAppointmentProfessional, setSelectedAppointmentProfessional] =
    useState<ServiceOption | null>(null);
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
  const [showServicesPickerModal, setShowServicesPickerModal] = useState(false);
  const [servicesPickerSearchInput, setServicesPickerSearchInput] = useState("");
  const [servicesPickerSearchTerm, setServicesPickerSearchTerm] = useState("");
  const [servicesPickerResults, setServicesPickerResults] = useState<ServiceSimpleOption[]>([]);
  const [servicesPickerLoading, setServicesPickerLoading] = useState(false);
  const [servicesPickerError, setServicesPickerError] = useState<string | null>(null);
  const [showProfessionalPickerModal, setShowProfessionalPickerModal] = useState(false);
  const [professionalSearchInput, setProfessionalSearchInput] = useState("");
  const [professionalSearchTerm, setProfessionalSearchTerm] = useState("");
  const [professionalPickerResults, setProfessionalPickerResults] = useState<ServiceOption[]>([]);
  const [professionalPickerLoading, setProfessionalPickerLoading] = useState(false);
  const [professionalPickerError, setProfessionalPickerError] = useState<string | null>(null);
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [appointmentDateInput, setAppointmentDateInput] = useState(formatDateParam(new Date()));
  const [appointmentTimeInput, setAppointmentTimeInput] = useState("09:00");
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleProductsList, setSaleProductsList] = useState<ProductListItem[]>([]);
  const [saleProductsLoading, setSaleProductsLoading] = useState(false);
  const [saleProductsError, setSaleProductsError] = useState<string | null>(null);
  const [selectedSaleProductId, setSelectedSaleProductId] = useState<number | null>(null);
  const [saleQuantityInput, setSaleQuantityInput] = useState("1");
  const [salePriceInput, setSalePriceInput] = useState("");
  const [salePaymentSelect, setSalePaymentSelect] = useState<PaymentType | "">("");
  const [isAddingSaleProduct, setIsAddingSaleProduct] = useState(false);
  const [addedSales, setAddedSales] = useState<AddedSaleItem[]>([]);

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
    setSelectedAppointmentProfessional(null);
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
                    typeof service === "number" ? service : service?.id ?? 0,
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

  const appointmentDiscountAmount = useMemo(() => {
    return (appointmentPriceValue * normalizedDiscount) / 100;
  }, [appointmentPriceValue, normalizedDiscount]);

  const appointmentTotalAfterDiscount = useMemo(() => {
    return Math.max(appointmentPriceValue - appointmentDiscountAmount, 0);
  }, [appointmentPriceValue, appointmentDiscountAmount]);

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
    if (datePickerRef.current && "showPicker" in datePickerRef.current) {
      datePickerRef.current.showPicker();
    } else {
      datePickerRef.current?.click();
    }
  };

  const handleEditDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDisplayDate(event.target.value);
    setEditUserValue("dateOfBirth", formatted, { shouldValidate: true });
  };

  const handleOpenEditDatePicker = () => {
    if (editDatePickerRef.current && "showPicker" in editDatePickerRef.current) {
      editDatePickerRef.current.showPicker();
    } else {
      editDatePickerRef.current?.click();
    }
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

  const handleStartCreateAppointment = () => {
    resetAppointmentForm();
    setIsCreatingAppointment(true);
  };

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

  const handleToggleAppointmentService = (service: ServiceSimpleOption) => {
    setSelectedAppointmentServices((previous) => {
      const exists = previous.some((item) => item.id === service.id);
      if (exists) {
        return previous.filter((item) => item.id !== service.id);
      }
      return [...previous, service];
    });
  };

  const handleRemoveAppointmentService = (serviceId: number) => {
    setSelectedAppointmentServices((previous) =>
      previous.filter((service) => service.id !== serviceId),
    );
  };

  const handleSelectProfessionalForAppointment = (professional: ServiceOption) => {
    setSelectedAppointmentProfessional(professional);
    setShowProfessionalPickerModal(false);
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

  const handleSubmitAppointment = async () => {
    setCreateAppointmentError(null);
    if (!accessToken) {
      setCreateAppointmentError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!selectedClient) {
      setCreateAppointmentError("Selecione um cliente.");
      return;
    }
    if (!selectedAppointmentProfessional) {
      setCreateAppointmentError("Selecione um profissional.");
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
    const priceValue = appointmentPriceValue;
    if (priceValue <= 0) {
      setCreateAppointmentError("Informe um preço válido.");
      return;
    }
    const dateTimeIso = buildDateTimeISOString(appointmentDateInput, appointmentTimeInput);
    if (!dateTimeIso) {
      setCreateAppointmentError("Informe uma data e hora válidas.");
      return;
    }
    setIsSavingAppointment(true);
    try {
      const payload = {
        date_time: dateTimeIso,
        client: selectedClient.id,
        professional: selectedAppointmentProfessional.id,
        services: selectedAppointmentServices.map((service) => service.id),
        price_paid: priceValue.toFixed(2),
        discount: normalizedDiscount,
        payment_type: selectedPaymentType,
        status: selectedAppointmentStatus,
        observations: appointmentObservations || null,
      };

      const response = await fetch(appointmentsEndpointBase, {
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
        let errorMessage = "Não foi possível criar o agendamento.";
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
        message: "Agendamento criado com sucesso.",
      });
      setAppointmentsRefreshToken((previous) => previous + 1);
      setIsCreatingAppointment(false);
      resetAppointmentForm();
    } catch (err) {
      setCreateAppointmentError(
        err instanceof Error
          ? err.message
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
              .map((service) =>
                typeof service === "number" ? service : service?.id ?? 0,
              )
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

  const renderHomeContent = () => (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">Home</p>
          <p className="text-2xl font-semibold">Bem-vindo, {firstName}</p>
        </div>
        {renderProfileMenu()}
      </header>

      <section className="mb-5 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <p className="text-lg font-semibold">Bem-vindo, {firstName}</p>
        <p className="text-sm text-white/60">
          Aqui está um resumo do desempenho da barbearia.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {statsCards.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card"
          >
            <p className="text-sm text-white/60">{item.title}</p>
            <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            <p className="mt-2 text-xs text-white/50">{item.sub}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <p className="text-sm text-white/60">Próximo Agendamento</p>
        <p className="mt-3 text-xl font-semibold">
          {nextAppointment.time} • {nextAppointment.service} • {nextAppointment.client}
        </p>
        <p className="mt-1 text-sm text-white/60">
          {nextAppointment.date} • com {nextAppointment.professional}
        </p>
      </section>

      <section className="mt-5 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <p className="text-lg font-semibold">Principais Serviços</p>
        <div className="mt-4 space-y-3">
          {topServices.map((service) => {
            const ServiceIcon = service.icon;
            return (
              <article
                key={service.name}
                className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
                    <ServiceIcon className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-base font-semibold">{service.name}</p>
                    <p className="text-xs text-white/60">{service.delta}</p>
                  </div>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-sm">
                  {service.total}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            Gráfico de Atendimento por Funcionário
          </p>
          <span className="text-xs text-white/60">Últimos 30 dias</span>
        </div>
        <div className="mt-6 flex items-end justify-between gap-3">
          {chartData.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center">
              <div className="relative mb-3 flex h-32 w-full items-end rounded-2xl bg-white/[0.04] p-1">
                <span
                  className="w-full rounded-2xl bg-gradient-to-t from-white to-white/60"
                  style={{ height: `${item.value}%` }}
                />
              </div>
              <p className="text-xs text-white/70">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <span className="h-3 w-3 rounded-full bg-white" />
          Serviços
        </div>
      </section>
    </>
  );

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

  const renderCreateAppointmentScreen = () => {
    const clientName = selectedClient
      ? [selectedClient.first_name, selectedClient.last_name].filter(Boolean).join(" ") ||
        selectedClient.email
      : "Selecionar";
    const professionalName = selectedAppointmentProfessional?.name ?? "Selecionar";
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
            <p className="text-2xl font-semibold">Novo agendamento</p>
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
              onClick={() => setShowServicesPickerModal(true)}
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
              {selectedAppointmentServices.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                >
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
                </li>
              ))}
            </ul>
          )}
          <p className="text-right text-sm text-white/60">
            Subtotal dos serviços:{" "}
            <span className="font-semibold text-white">
              {formatCurrency(appointmentServicesSubtotal.toFixed(2))}
            </span>
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5">
          <p className="text-sm text-white/60">Cliente</p>
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
          <p className="text-sm text-white/60">Profissional</p>
          <button
            type="button"
            onClick={() => setShowProfessionalPickerModal(true)}
            className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{professionalName}</p>
                <p className="text-xs text-white/60">Selecione quem executará o serviço.</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50" />
          </button>
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
                const value = Number(service.price ?? 0);
                const cleanValue = Number.isNaN(value) ? 0 : value;
                const discounted = Math.max(
                  cleanValue - (cleanValue * normalizedDiscount) / 100,
                  0,
                );
                return (
                  <div
                    key={`summary-${service.id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2"
                  >
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-xs text-white/60">
                        Valor original: {formatCurrency(cleanValue.toFixed(2))}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(discounted.toFixed(2))}
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
              <span>{formatCurrency(appointmentTotalAfterDiscount.toFixed(2))}</span>
            </div>
            <p className="mt-1 text-xs text-white/60">
              Desconto aplicado: {normalizedDiscount}% (
              {formatCurrency(appointmentDiscountAmount.toFixed(2))})
            </p>
          </div>
        </fieldset>
      </div>
    );
  };

  const renderAppointmentsContent = () => {
    if (isCreatingAppointment) {
      return renderCreateAppointmentScreen();
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
                  className="flex items-center justify-between rounded-3xl border border-white/5 bg-[#0b0b0b] px-4 py-3"
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

  const renderComingSoon = (label: string) => (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 pt-24 text-center text-white/60">
      <p className="text-lg font-semibold">{label}</p>
      <p className="text-sm">Em breve você verá informações aqui.</p>
    </div>
  );

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
        return renderComingSoon("Produtos");
      case "finances":
        return renderComingSoon("Financeiro");
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
                onClick={() => setShowServicesPickerModal(false)}
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
                    const isSelected = selectedAppointmentServices.some(
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
                            onChange={() => handleToggleAppointmentService(service)}
                            className="h-4 w-4 rounded border-white/20 bg-transparent text-black"
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
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
                onClick={() => setShowProfessionalPickerModal(false)}
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
                    const isSelected = professional.id === selectedAppointmentProfessional?.id;
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
type ProductListItem = {
  id: number;
  name: string;
  price_to_sell: string;
};

type ProductsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[];
};

type AddedSaleItem = {
  productId: number;
  productName: string;
  price: string;
  quantity: number;
  paymentType: PaymentType;
};
