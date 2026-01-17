import type { AppointmentProfessionalSlot } from "@/src/features/appointments/types";
import { parseCurrencyInput } from "@/src/features/shared/utils/money";
import { generateUniqueId } from "@/src/features/shared/utils/id";

export const createProfessionalSlot = (): AppointmentProfessionalSlot => ({
  id: generateUniqueId(),
  professional: null,
});

export const getDefaultServicePrice = (price: string | number | null | undefined) => {
  const parsed = parseCurrencyInput(String(price ?? 0));
  return Number.isNaN(parsed) ? "0.00" : parsed.toFixed(2);
};

export const formatDurationLabel = (duration: string) => {
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
