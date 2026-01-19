export const formatCurrency = (price: string) => {
  const numeric = Number(price);
  if (Number.isNaN(numeric)) {
    return price;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeric);
};

export const parseCurrencyInput = (value: string) => {
  if (!value) {
    return 0;
  }
  const cleaned = value.replace(/[^\d,.-]/g, "");
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  const normalized = hasComma && hasDot
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : hasComma
      ? cleaned.replace(",", ".")
      : cleaned;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatMoneyInputValue = (value: string) => {
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

export const normalizeMoneyValue = (value: string) => {
  if (!value) {
    return "0";
  }
  return parseCurrencyInput(value).toFixed(2);
};

export const formatMoneyFromDecimalString = (value: string) => {
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
