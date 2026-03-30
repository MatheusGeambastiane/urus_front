"use client";

import { useEffect, useRef, useState } from "react";
import type { AppointmentItem } from "@/src/features/appointments/types";
import { AppointmentCard } from "@/src/features/appointments/components/AppointmentCard";

type AppointmentListProps = {
  appointments: AppointmentItem[];
  onOpen: (appointmentId: number) => void;
  onComplete: (appointmentId: number) => Promise<void> | void;
  onReopen: (appointmentId: number) => Promise<void> | void;
  statusUpdatingId: number | null;
};

const INITIAL_VISIBLE_APPOINTMENTS = 10;
const APPOINTMENTS_BATCH_SIZE = 8;

export function AppointmentList({
  appointments,
  onOpen,
  onComplete,
  onReopen,
  statusUpdatingId,
}: AppointmentListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_APPOINTMENTS);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_APPOINTMENTS);
  }, [appointments]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= appointments.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((current) => Math.min(current + APPOINTMENTS_BATCH_SIZE, appointments.length));
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [appointments.length, visibleCount]);

  const visibleAppointments = appointments.slice(0, visibleCount);
  const hasMoreAppointments = visibleCount < appointments.length;

  return (
    <section className="space-y-0">
      {visibleAppointments.map((appointment, index) => (
        <div key={appointment.id} className={index === visibleAppointments.length - 1 ? "last:border-0" : ""}>
          <AppointmentCard
            appointment={appointment}
            onOpen={onOpen}
            onComplete={onComplete}
            onReopen={onReopen}
            completing={statusUpdatingId === appointment.id}
          />
        </div>
      ))}
      {hasMoreAppointments ? <div ref={loadMoreRef} className="h-6" aria-hidden="true" /> : null}
    </section>
  );
}
