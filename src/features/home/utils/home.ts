"use client";

export const summaryFilterMonthOptions = [
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

export const parseIsoDate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

export const isSameDay = (left: Date | null, right: Date | null) => {
  if (!left || !right) {
    return false;
  }

  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  );
};

export const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) {
    return false;
  }

  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
};

export const addMonths = (date: Date, offset: number) => {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
};

export const buildCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const totalCells = 42;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - startWeekday + 1;
    if (dayOffset <= 0) {
      const date = new Date(year, month - 1, daysInPreviousMonth + dayOffset);
      return { date, inMonth: false };
    }
    if (dayOffset > daysInMonth) {
      const date = new Date(year, month + 1, dayOffset - daysInMonth);
      return { date, inMonth: false };
    }
    return { date: new Date(year, month, dayOffset), inMonth: true };
  });
};

export const getSummaryMonthLabel = (date: Date) => {
  return summaryFilterMonthOptions[date.getMonth()]?.label ?? "";
};

export const formatShortDate = (value?: string | null) => {
  if (!value) return "--";
  const date = parseIsoDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
};

export const formatShortTime = (value?: string | null) => {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getWeekdayLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .slice(0, 3);
};

export const getWeekdayNumberLabel = (day?: number | null) => {
  const dayMap = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
  if (typeof day !== "number" || Number.isNaN(day)) {
    return "";
  }
  return dayMap[day] ?? String(day);
};

export const formatFullDate = (value?: string | null) => {
  if (!value) return "--/--/----";
  const date = parseIsoDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  return date.toLocaleDateString("pt-BR");
};

export const formatRangeLabel = (start?: string | null, end?: string | null) => {
  if (!start && !end) return "--";
  if (start && end && start === end) {
    return formatFullDate(start);
  }
  if (!start || !end) {
    return formatFullDate(start ?? end);
  }
  return `${formatFullDate(start)} até ${formatFullDate(end)}`;
};

export const formatCompactRangeLabel = (start?: string | null, end?: string | null) => {
  if (!start && !end) return "--";
  if (start && end && start === end) {
    const date = parseIsoDate(start);
    return date ? String(date.getDate()).padStart(2, "0") : formatFullDate(start);
  }

  const startDate = start ? parseIsoDate(start) : null;
  const endDate = end ? parseIsoDate(end) : null;
  const startDay = startDate ? String(startDate.getDate()).padStart(2, "0") : "--";
  const endDay = endDate ? String(endDate.getDate()).padStart(2, "0") : "--";
  return `${startDay}-${endDay}`;
};
