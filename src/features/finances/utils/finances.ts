import type { PaymentType } from "@/src/shared/types/payment";
import type { RepasseDetail } from "@/src/features/repasses/types";
import { parseCurrencyInput } from "@/src/features/shared/utils/money";
import {
  AlertTriangle,
  Coins,
  CreditCard,
  FileText,
  QrCode,
  Repeat,
  Sparkles,
  Shuffle,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const formatMonthParam = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

export const getMonthLabel = (monthValue: string) => {
  const [year, month] = monthValue.split("-");
  if (!year || !month) {
    return "Mês atual";
  }
  const parsedDate = new Date(Number(year), Number(month) - 1, 1);
  return parsedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export const billTypeOptions = [
  { value: "maintenance", label: "Manutenção", icon: Wrench },
  { value: "creditcard", label: "Cartão de crédito", icon: CreditCard },
  { value: "tax", label: "Imposto", icon: Coins },
  { value: "marketing", label: "Marketing", icon: Sparkles },
] as const;

export const getBillTypeDefinition = (value: string | null | undefined) => {
  if (!value) {
    return { label: "Categoria", icon: FileText };
  }
  const option = billTypeOptions.find((item) => item.value === value);
  if (option) {
    return { label: option.label, icon: option.icon };
  }
  return { label: value, icon: FileText };
};

export const formatMonthReference = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const calculateRepasseTotals = (detail: RepasseDetail | null) => {
  if (!detail) {
    return { total: 0, paid: 0, remaining: 0 };
  }
  const serviceValue = parseCurrencyInput(detail.value_service ?? "0");
  const productValue = parseCurrencyInput(detail.value_product ?? "0");
  const allowenceValue = parseCurrencyInput(detail.allowence ?? "0");
  const total = serviceValue + productValue + allowenceValue;
  const paid = detail.transactions.reduce((accumulator, transaction) => {
    return accumulator + parseCurrencyInput(transaction.price ?? "0");
  }, 0);
  const remaining = Math.max(total - paid, 0);
  return { total, paid, remaining };
};

export const priceStatusColor = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "realizado" || normalized === "completed") {
    return "text-emerald-400";
  }
  if (normalized === "iniciado" || normalized === "started") {
    return "text-sky-400";
  }
  return "text-amber-300";
};

export const billFrequencyOptions = [
  { value: "fixed", label: "Fixo", icon: Repeat },
  { value: "unprevisible", label: "Imprevisível", icon: Shuffle },
  { value: "emergency", label: "Emergencial", icon: AlertTriangle },
] as const;

export const getBillFrequencyLabel = (value: string | null | undefined) => {
  if (!value) {
    return "Tipo";
  }
  const option = billFrequencyOptions.find((item) => item.value === value);
  return option?.label ?? value;
};

export const paymentTypeOptions: { value: PaymentType; label: string; icon: LucideIcon }[] = [
  { value: "credit", label: "Cartão de crédito", icon: CreditCard },
  { value: "debit", label: "Cartão de débito", icon: Wallet },
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "dinheiro", label: "Dinheiro", icon: Coins },
];

export const getPaymentTypeLabel = (value: PaymentType | null | undefined) => {
  if (!value) {
    return "";
  }
  return paymentTypeOptions.find((option) => option.value === value)?.label ?? value;
};
