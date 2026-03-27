"use client";

import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { AppointmentFormScreen } from "@/src/features/appointments/components/AppointmentFormScreen";
import { useAppointmentForm } from "@/src/features/appointments/hooks/useAppointmentForm";

export function CreateAppointmentPage() {
  const router = useRouter();
  const { accessToken, fetchWithAuth, userRole } = useAuth();
  const form = useAppointmentForm({
    accessToken,
    fetchWithAuth,
    onSuccess: (savedAppointmentId) => {
      if (savedAppointmentId) {
        router.push(`/dashboard/agenda/${savedAppointmentId}`);
        return;
      }
      router.push("/dashboard/agenda");
    },
  });

  return (
    <DashboardShell activeTab="agenda" userRole={userRole}>
      <AppointmentFormScreen form={form} onBack={() => router.push("/dashboard/agenda")} />
    </DashboardShell>
  );
}
