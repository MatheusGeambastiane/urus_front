import { Gem, Package, Scissors, Sparkles, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  cortes: Scissors,
  corte: Scissors,
  barba: Gem,
  massagem: Waves,
  combo: Package,
};

export const getServiceIcon = (categoryName: string) => {
  if (!categoryName) {
    return Sparkles;
  }
  const key = categoryName.toLowerCase();
  return categoryIconMap[key] ?? Sparkles;
};
