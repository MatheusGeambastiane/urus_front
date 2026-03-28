"use client";

import type { AppointmentItem } from "@/src/features/appointments/types";
import { AppointmentCard } from "@/src/features/appointments/components/AppointmentCard";

type AppointmentListProps = {
  appointments: AppointmentItem[];
  onOpen: (appointmentId: number) => void;
  onComplete: (appointmentId: number) => Promise<void> | void;
  onReopen: (appointmentId: number) => Promise<void> | void;
  statusUpdatingId: number | null;
};

export function AppointmentList({
  appointments,
  onOpen,
  onComplete,
  onReopen,
  statusUpdatingId,
}: AppointmentListProps) {
  return (
    <section className="space-y-0">
      {appointments.map((appointment, index) => (
        <div key={appointment.id} className={index === appointments.length - 1 ? "last:border-0" : ""}>
          <AppointmentCard
            appointment={appointment}
            onOpen={onOpen}
            onComplete={onComplete}
            onReopen={onReopen}
            completing={statusUpdatingId === appointment.id}
          />
        </div>
      ))}
    </section>
  );
}
