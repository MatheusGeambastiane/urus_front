"use client";

import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { AppointmentFormScreen } from "@/src/features/appointments/components/AppointmentFormScreen";
import { useAppointmentForm } from "@/src/features/appointments/hooks/useAppointmentForm";

type Props = {
  id: string;
};

export function EditAppointmentPage({ id }: Props) {
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const numericId = Number(id);

  const form = useAppointmentForm({
    appointmentId: Number.isNaN(numericId) ? null : numericId,
    accessToken,
    fetchWithAuth,
    onSuccess: (savedAppointmentId) => {
      const targetId = savedAppointmentId ?? numericId;
      if (targetId) {
        router.push(`/dashboard/agenda/${targetId}`);
        return;
      }
      router.push("/dashboard/agenda");
    },
  });

  return (
    <DashboardShell activeTab="agenda" profilePic={profilePic} userRole={userRole}>
      <AppointmentFormScreen form={form} onBack={() => router.push(`/dashboard/agenda/${id}`)} />
    </DashboardShell>
  );
}
