"use client";

import type { ServiceItem } from "@/src/features/services/types";
import { formatDurationLabel } from "@/src/features/appointments/utils/appointments";
import { formatCurrency } from "@/src/features/shared/utils/money";
import { getServiceIcon } from "@/src/features/services/utils/services";

type ServiceCardProps = {
  service: ServiceItem;
  onClick: (id: number) => void;
};

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const Icon = getServiceIcon(service.category_name || "");

  return (
    <button
      type="button"
      onClick={() => onClick(service.id)}
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
}
