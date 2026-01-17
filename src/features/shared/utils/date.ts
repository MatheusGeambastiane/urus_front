export const formatDisplayDate = (value: string) => {
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

export const convertDisplayDateToIso = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) {
    return null;
  }
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4);
  return `${year}-${month}-${day}`;
};

export const formatTimeInputValue = (dateValue: Date) =>
  `${dateValue.getHours().toString().padStart(2, "0")}:${dateValue
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

export const formatIsoToDisplay = (iso: string) => {
  if (!iso) {
    return "";
  }
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) {
    return "";
  }
  return `${day}/${month}/${year}`;
};

export const buildDateTimeISOString = (date: string, time: string) => {
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

export const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDatePillLabel = (date: Date, today: Date) => {
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
